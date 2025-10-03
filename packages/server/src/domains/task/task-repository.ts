import { SseManager } from "@/domains/sse/sse-manager.js";
import { TaskCompletionRepository } from "@/domains/task-completion/task-completion-repository.js";
import { diffInMilliseconds, startOfDay, startOfNextDay } from "@/lib/datetime-utils.js";
import { Database, DbSchema } from "@org/database/index";
import { SseContract, TaskContract } from "@org/domain/api/Contracts";
import type { GetByIdParams } from "@org/domain/api/TaskContract";
import { TaskId, type UserId } from "@org/domain/EntityIds";
import { TaskNotFoundError } from "@org/domain/Errors";
import { JobQueue } from "@org/domain/Queue";
import * as d from "drizzle-orm";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Schedule from "effect/Schedule";
import * as Schema from "effect/Schema";
import { calculateNextDate } from "./frequency-utils.js";

export class TaskRepository extends Effect.Service<TaskRepository>()("TaskRepository", {
  effect: Effect.gen(function* () {
    const db = yield* Database.Database;
    const taskCompletionRepository = yield* TaskCompletionRepository;
    const queue = yield* JobQueue;
    const sseManager = yield* SseManager;

    const create = db.makeQuery(
      (
        execute,
        input: typeof TaskContract.CreateTaskPayload.Type & {
          createdBy: UserId;
        },
      ) =>
        execute((client) =>
          client
            .insert(DbSchema.task)
            .values({ ...input, nextExecutionDate: calculateNextDate(input.frequency, new Date()) })
            .returning(),
        ).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(TaskContract.Task)),
          Effect.tap((task) =>
            taskCompletionRepository
              .create({
                taskId: task.id,
                experience: task.experience,
              })
              .pipe(
                Effect.retryOrElse(
                  Schedule.addDelay(Schedule.recurs(2), () => "100 millis"),
                  () => Effect.dieMessage("Failed to create task completion"),
                ),
                Effect.tap((taskCompletion) =>
                  sseManager.notifyCurrentUser(
                    new SseContract.TaskCompletionEvents.UpsertedTaskCompletion({
                      taskCompletion,
                    }),
                  ),
                ),
              ),
          ),
          Effect.tap((task) =>
            queue.enqueueDelayed(task, diffInMilliseconds(new Date(), task.nextExecutionDate)),
          ),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: () => Effect.dieMessage(""),
            ParseError: Effect.die,
            JobQueueEnqueueJobError: Effect.die,
          }),
          Effect.withSpan("TaskRepository.create"),
        ),
    );

    const updateExecutionDate = db.makeQuery(
      (execute, input: typeof TaskContract.UpdateTaskExecutionDatePayload.Type) =>
        execute((client) =>
          client
            .update(DbSchema.task)
            .set(input)
            .where(d.eq(DbSchema.task.id, input.id))
            .returning(),
        ).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(TaskContract.Task)),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: () =>
              new TaskNotFoundError({
                message: `Task with id ${input.id} not found`,
              }),
            ParseError: Effect.die,
          }),
          Effect.withSpan("TaskRepository.updateExecutionDate"),
        ),
    );

    const update = db.makeQuery((execute, input: typeof TaskContract.UpdateTaskPayload.Type) =>
      execute((client) =>
        client.update(DbSchema.task).set(input).where(d.eq(DbSchema.task.id, input.id)).returning(),
      ).pipe(
        Effect.flatMap(Array.head),
        Effect.flatMap(Schema.decode(TaskContract.Task)),
        Effect.tap((task) =>
          updateExecutionDate({
            id: task.id,
            nextExecutionDate: calculateNextDate(task.frequency, task.prevExecutionDate),
            prevExecutionDate: task.prevExecutionDate,
          }),
        ),
        Effect.tap((task) => {
          return queue.updateJob(task, diffInMilliseconds(new Date(), task.nextExecutionDate));
        }),
        Effect.tap((task) => {
          const taskCompletions = taskCompletionRepository.findManyPendingByTaskId(task.id);

          return taskCompletions.pipe(
            Effect.flatMap(
              Effect.forEach((taskCompletion) => {
                return taskCompletionRepository.update({
                  id: taskCompletion.id,
                  experience: task.experience,
                });
              }),
            ),
          );
        }),
        Effect.catchTags({
          DatabaseError: Effect.die,
          NoSuchElementException: () =>
            new TaskNotFoundError({
              message: `Task with id ${input.id} not found`,
            }),
          ParseError: Effect.die,
          TaskCompletionNotFoundError: Effect.die,
          JobQueueCancelJobError: Effect.die,
          JobQueueEnqueueJobError: Effect.die,
        }),
        Effect.withSpan("TaskRepository.update"),
      ),
    );

    const findById = db.makeQuery((execute, input: typeof GetByIdParams.Type) =>
      execute((client) =>
        client.query.task.findFirst({
          where: (task, { eq }) => eq(task.id, input.id),
        }),
      ).pipe(
        Effect.flatMap((task) => {
          if (!task)
            return Effect.fail(
              new TaskNotFoundError({ message: `Task with id ${input.id} not found` }),
            );

          return Effect.succeed(task);
        }),
        Effect.flatMap(Schema.decode(TaskContract.Task)),
        Effect.catchTags({
          DatabaseError: Effect.die,
          ParseError: Effect.die,
        }),
        Effect.withSpan("TaskRepository.findById"),
      ),
    );

    const findAll = db.makeQuery((execute, input: typeof TaskContract.GetTasksUrlParams.Type) =>
      execute((client) =>
        client.query.task.findMany({
          where: (tasks, { and, gte, lte }) =>
            input.from
              ? and(
                  gte(
                    tasks.nextExecutionDate,
                    startOfDay(Schema.decodeSync(Schema.Date)(input.from)),
                  ),
                  lte(
                    tasks.nextExecutionDate,
                    startOfNextDay(Schema.decodeSync(Schema.Date)(input.from)),
                  ),
                )
              : undefined,
          orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
        }),
      ).pipe(
        Effect.flatMap(Schema.decode(Schema.Array(TaskContract.Task))),
        Effect.catchTags({
          DatabaseError: Effect.die,
          ParseError: Effect.die,
        }),
        Effect.withSpan("TaskRepository.findAll"),
      ),
    );

    const del = db.makeQuery((execute, input: TaskId) =>
      execute((client) =>
        client
          .delete(DbSchema.task)
          .where(d.eq(DbSchema.task.id, input))
          .returning({ id: DbSchema.task.id }),
      ).pipe(
        Effect.flatMap(Array.head),
        Effect.flatMap(Schema.decode(Schema.Struct({ id: TaskId }))),
        Effect.tap((task) => {
          return queue.cancelJob(task.id);
        }),
        Effect.catchTags({
          DatabaseError: Effect.die,
          NoSuchElementException: () =>
            new TaskNotFoundError({
              message: `Task with id ${input} not found`,
            }),
          ParseError: Effect.die,
          JobQueueCancelJobError: Effect.die,
        }),
        Effect.withSpan("TaskRepository.del"),
      ),
    );

    return {
      create,
      del,
      findAll,
      findById,
      update,
      updateExecutionDate,
    };
  }),
  dependencies: [TaskCompletionRepository.Default, SseManager.Default],
}) {}
