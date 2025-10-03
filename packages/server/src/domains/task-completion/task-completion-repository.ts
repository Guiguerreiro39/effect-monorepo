import { Database, DbSchema } from "@org/database/index";
import { TaskCompletionContract } from "@org/domain/api/Contracts";
import { TaskCompletionId, type TaskId } from "@org/domain/EntityIds";
import { TaskCompletionStatus } from "@org/domain/Enums";
import { TaskCompletionNotFoundError } from "@org/domain/Errors";
import * as d from "drizzle-orm";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

export class TaskCompletionRepository extends Effect.Service<TaskCompletionRepository>()(
  "TaskCompletionRepository",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database.Database;

      const create = db.makeQuery(
        (execute, input: typeof TaskCompletionContract.CreateTaskCompletionPayload.Type) =>
          execute((client) =>
            client.insert(DbSchema.taskCompletion).values(input).returning(),
          ).pipe(
            Effect.flatMap(Array.head),
            Effect.flatMap(Schema.decode(TaskCompletionContract.TaskCompletion)),
            Effect.catchTags({
              DatabaseError: Effect.die,
              NoSuchElementException: Effect.die,
              ParseError: Effect.die,
            }),
            Effect.withSpan("TaskCompletionRepository.create"),
          ),
      );

      const update = db.makeQuery(
        (execute, input: typeof TaskCompletionContract.UpdateTaskCompletionPayload.Type) =>
          execute((client) =>
            client
              .update(DbSchema.taskCompletion)
              .set(input)
              .where(d.eq(DbSchema.taskCompletion.id, input.id))
              .returning(),
          ).pipe(
            Effect.flatMap(Array.head),
            Effect.flatMap(Schema.decode(TaskCompletionContract.TaskCompletion)),
            Effect.catchTags({
              DatabaseError: Effect.die,
              NoSuchElementException: () =>
                new TaskCompletionNotFoundError({
                  message: `TaskCompletion with id ${input.id} not found`,
                }),
              ParseError: Effect.die,
            }),
            Effect.withSpan("TaskCompletionRepository.update"),
          ),
      );

      const findMany = db.makeQuery(
        (execute, input: typeof TaskCompletionContract.GetTaskCompletionPayload.Type) =>
          execute((client) =>
            client.query.taskCompletion.findMany({
              where: d.and(
                input.taskId ? d.eq(DbSchema.taskCompletion.taskId, input.taskId) : undefined,
                input.status ? d.eq(DbSchema.taskCompletion.status, input.status) : undefined,
              ),
              orderBy: (task_completions, { desc }) => [desc(task_completions.createdAt)],
            }),
          ).pipe(
            Effect.flatMap(Schema.decode(Schema.Array(TaskCompletionContract.TaskCompletion))),
            Effect.catchTags({
              DatabaseError: Effect.die,
              ParseError: Effect.die,
            }),
            Effect.withSpan("TaskCompletionRepository.findAll"),
          ),
      );

      const findManyPendingByTaskId = db.makeQuery((execute, taskId: TaskId) =>
        execute((client) =>
          client.query.taskCompletion.findMany({
            where: d.and(
              d.eq(DbSchema.taskCompletion.taskId, taskId),
              d.eq(DbSchema.taskCompletion.status, TaskCompletionStatus.Pending),
            ),
            orderBy: (task_completions, { desc }) => [desc(task_completions.createdAt)],
          }),
        ).pipe(
          Effect.flatMap(Schema.decode(Schema.Array(TaskCompletionContract.TaskCompletion))),
          Effect.catchTags({
            DatabaseError: Effect.die,
            ParseError: Effect.die,
          }),
          Effect.withSpan("TaskCompletionRepository.findAll"),
        ),
      );

      const del = db.makeQuery(
        (execute, input: typeof TaskCompletionContract.DeleteTaskCompletionPayload.Type) =>
          execute((client) =>
            client
              .delete(DbSchema.taskCompletion)
              .where(d.eq(DbSchema.taskCompletion.id, input.id))
              .returning({ id: DbSchema.taskCompletion.id }),
          ).pipe(
            Effect.flatMap(Array.head),
            Effect.flatMap(Schema.decode(Schema.Struct({ id: TaskCompletionId }))),
            Effect.catchTags({
              DatabaseError: Effect.die,
              NoSuchElementException: () =>
                new TaskCompletionNotFoundError({
                  message: `TaskCompletion with id ${input} not found`,
                }),
              ParseError: Effect.die,
            }),
            Effect.withSpan("TaskCompletionRepository.del"),
          ),
      );

      return {
        create,
        del,
        findMany,
        findManyPendingByTaskId,
        update,
      };
    }),
  },
) {}
