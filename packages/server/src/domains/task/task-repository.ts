import { diffInMilliseconds, startOfDay, startOfNextDay } from "@/lib/datetime-utils.js";
import { Database, DbSchema } from "@org/database/index";
import { TaskContract } from "@org/domain/api/Contracts";
import type { GetByIdParams } from "@org/domain/api/TaskContract";
import { TaskId, type UserId } from "@org/domain/EntityIds";
import { ActivityType, TaskActivityStatus } from "@org/domain/Enums";
import { TaskNotFoundError, TaskUpdateNotAllowed } from "@org/domain/Errors";
import { CurrentUser } from "@org/domain/Policy";
import { JobQueue } from "@org/domain/Queue";
import * as d from "drizzle-orm";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { ActivityRepository } from "../activity/activity-repository.js";
import { UserMetadataRepository } from "../user-metadata/user-metadata-repository.js";
import { calculateNextDate } from "./utils/frequency.js";
import { createHash } from "./utils/hash-identifier.js";

export class TaskRepository extends Effect.Service<TaskRepository>()("TaskRepository", {
  effect: Effect.gen(function* () {
    const db = yield* Database.Database;
    const activityRepository = yield* ActivityRepository;
    const userMetadataRepository = yield* UserMetadataRepository;
    const queue = yield* JobQueue;

    const create = db.makeQuery(
      (
        execute,
        input: typeof TaskContract.CreateTaskPayload.Type & {
          createdBy: UserId;
        },
      ) =>
        Effect.gen(function* () {
          const hash = yield* createHash({
            title: input.title,
            executionDate: startOfDay(new Date()),
          });

          return yield* execute((client) =>
            client
              .insert(DbSchema.task)
              .values({
                ...input,
                hashIdentifier: hash,
              })
              .returning(),
          );
        }).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(TaskContract.Task)),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: () => Effect.dieMessage(""),
            ParseError: Effect.die,
            HashIdentifierError: Effect.die,
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

    const update = db.makeQuery((execute, input: typeof TaskContract.UpdateTaskPayload.Type) =>
      Effect.gen(function* () {
        const currentTask = yield* findById({ id: input.id }).pipe(
          Effect.catchTags({
            TaskNotFoundError: Effect.die,
          }),
        );

        if (
          input.experience &&
          currentTask.experience !== input.experience &&
          (input.isCompleted || currentTask.isCompleted)
        ) {
          return yield* Effect.fail(
            new TaskUpdateNotAllowed({
              message: `Task with id ${input.id} cannot be updated since it is currently completed`,
            }),
          );
        }

        return yield* execute((client) =>
          client
            .update(DbSchema.task)
            .set(input)
            .where(d.eq(DbSchema.task.id, input.id))
            .returning(),
        ).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(TaskContract.Task)),
          Effect.tap((task) =>
            Effect.gen(function* () {
              const nextExecutionDate = calculateNextDate(task.frequency, new Date());
              const currentUser = yield* CurrentUser;
              const activity = yield* activityRepository.findByHashIdentifier({
                hashIdentifier: task.hashIdentifier,
              });

              if (task.isCompleted && Array.isEmptyReadonlyArray(activity)) {
                yield* updateExecutionDate({
                  id: task.id,
                  nextExecutionDate,
                });

                yield* activityRepository.create({
                  taskId: task.id,
                  status: TaskActivityStatus.Completed,
                  experience: task.experience,
                  title: task.title,
                  completedBy: currentUser.userId,
                  hashIdentifier: task.hashIdentifier,
                  type: ActivityType.Task,
                });

                yield* userMetadataRepository.update({
                  experience: currentUser.metadata.experience + task.experience,
                  userId: currentUser.userId,
                });

                yield* queue.enqueueDelayed(
                  task,
                  diffInMilliseconds(new Date(), nextExecutionDate),
                );
              }

              if (!task.isCompleted && Array.isNonEmptyReadonlyArray(activity)) {
                yield* updateExecutionDate({
                  id: task.id,
                  nextExecutionDate: startOfDay(new Date()),
                });

                yield* userMetadataRepository.update({
                  experience: currentUser.metadata.experience - task.experience,
                  userId: currentUser.userId,
                });

                yield* activityRepository.del({ id: activity[0].id });

                yield* queue.cancelJob(task.id);
              }
            }),
          ),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: () =>
              new TaskNotFoundError({
                message: `Task with id ${input.id} not found`,
              }),

            ParseError: Effect.die,
            UserMetadataNotFoundError: Effect.die,
            JobQueueCancelJobError: Effect.die,
            JobQueueEnqueueJobError: Effect.die,
            ActivityNotFoundError: Effect.die,
          }),
          Effect.withSpan("TaskRepository.update"),
        );
      }),
    );

    const findAll = db.makeQuery((execute, input: typeof TaskContract.GetTasksUrlParams.Type) =>
      execute((client) =>
        client.query.task.findMany({
          where: (tasks, { and, gte, lte }) =>
            input.executionDate
              ? and(
                  gte(
                    tasks.nextExecutionDate,
                    startOfDay(Schema.decodeSync(Schema.Date)(input.executionDate)),
                  ),
                  lte(
                    tasks.nextExecutionDate,
                    startOfNextDay(Schema.decodeSync(Schema.Date)(input.executionDate)),
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
  dependencies: [ActivityRepository.Default, UserMetadataRepository.Default],
}) {}
