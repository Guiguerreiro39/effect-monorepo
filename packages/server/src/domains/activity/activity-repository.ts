import { Database, DbSchema } from "@org/database/index";
import { ActivityContract, SseContract } from "@org/domain/api/Contracts";
import { ActivityId } from "@org/domain/EntityIds";
import { ActivityNotFoundError } from "@org/domain/Errors";
import * as d from "drizzle-orm";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { SseManager } from "../sse/sse-manager.js";

export class ActivityRepository extends Effect.Service<ActivityRepository>()("ActivityRepository", {
  effect: Effect.gen(function* () {
    const db = yield* Database.Database;
    const sseManager = yield* SseManager;

    const create = db.makeQuery(
      (execute, input: typeof ActivityContract.CreateActivityPayload.Type) =>
        execute((client) => client.insert(DbSchema.activity).values(input).returning()).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(ActivityContract.Activity)),
          Effect.tap((activity) =>
            sseManager.notifyCurrentUser(
              new SseContract.ActivityEvents.UpsertedActivity({
                activity,
              }),
            ),
          ),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: Effect.die,
            ParseError: Effect.die,
          }),
          Effect.withSpan("ActivityRepository.create"),
        ),
    );

    const update = db.makeQuery(
      (execute, input: typeof ActivityContract.UpdateActivityPayload.Type) =>
        execute((client) =>
          client
            .update(DbSchema.activity)
            .set(input)
            .where(d.eq(DbSchema.activity.id, input.id))
            .returning(),
        ).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(ActivityContract.Activity)),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: () =>
              new ActivityNotFoundError({
                message: `Activity with id ${input.id} not found`,
              }),
            ParseError: Effect.die,
          }),
          Effect.withSpan("ActivityRepository.update"),
        ),
    );

    const findMany = db.makeQuery((execute) =>
      execute((client) =>
        client.query.activity.findMany({
          orderBy: (task_completions, { desc }) => [desc(task_completions.createdAt)],
        }),
      ).pipe(
        Effect.flatMap(Schema.decode(Schema.Array(ActivityContract.Activity))),
        Effect.catchTags({
          DatabaseError: Effect.die,
          ParseError: Effect.die,
        }),
        Effect.withSpan("ActivityRepository.findAll"),
      ),
    );

    const findByHashIdentifier = db.makeQuery(
      (execute, input: typeof ActivityContract.FindByHashIdentifierPayload.Type) =>
        execute((client) =>
          client.query.activity.findMany({
            where: d.eq(DbSchema.activity.hashIdentifier, input.hashIdentifier),
          }),
        ).pipe(
          Effect.flatMap(Schema.decode(Schema.Array(ActivityContract.Activity))),
          Effect.catchTags({
            DatabaseError: Effect.die,
            ParseError: Effect.die,
          }),
          Effect.withSpan("ActivityRepository.findByHashIdentifier"),
        ),
    );

    const del = db.makeQuery((execute, input: typeof ActivityContract.DeleteActivityPayload.Type) =>
      execute((client) =>
        client
          .delete(DbSchema.activity)
          .where(d.eq(DbSchema.activity.id, input.id))
          .returning({ id: DbSchema.activity.id }),
      ).pipe(
        Effect.flatMap(Array.head),
        Effect.flatMap(Schema.decode(Schema.Struct({ id: ActivityId }))),
        Effect.tap((activity) =>
          sseManager.notifyCurrentUser(
            new SseContract.ActivityEvents.DeletedActivity({ id: activity.id }),
          ),
        ),
        Effect.catchTags({
          DatabaseError: Effect.die,
          NoSuchElementException: () =>
            new ActivityNotFoundError({
              message: `Activity with id ${input} not found`,
            }),
          ParseError: Effect.die,
        }),
        Effect.withSpan("ActivityRepository.delete"),
      ),
    );

    return {
      create,
      del,
      findMany,
      findByHashIdentifier,
      update,
    };
  }),
  dependencies: [SseManager.Default],
}) {}
