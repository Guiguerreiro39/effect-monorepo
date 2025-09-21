import { Database, DbSchema } from "@org/database/index";
import { ChoresContract } from "@org/domain/api/Contracts";
import { ChoreId, type UserId } from "@org/domain/EntityIds";
import * as d from "drizzle-orm";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

export class ChoresRepository extends Effect.Service<ChoresRepository>()("ChoresRepository", {
  effect: Effect.gen(function* () {
    const db = yield* Database.Database;

    const create = db.makeQuery(
      (execute, input: typeof ChoresContract.CreateChorePayload.Type & { createdBy: UserId }) =>
        execute((client) => client.insert(DbSchema.choresTable).values(input).returning()).pipe(
          Effect.flatMap(Array.head),
          Effect.flatMap(Schema.decode(ChoresContract.Chore)),
          Effect.catchTags({
            DatabaseError: Effect.die,
            NoSuchElementException: () => Effect.dieMessage(""),
            ParseError: Effect.die,
          }),
          Effect.withSpan("ChoresRepository.create"),
        ),
    );

    const update = db.makeQuery((execute, input: typeof ChoresContract.UpdateChorePayload.Type) =>
      execute((client) =>
        client
          .update(DbSchema.choresTable)
          .set(input)
          .where(d.eq(DbSchema.choresTable.id, input.id))
          .returning(),
      ).pipe(
        Effect.flatMap(Array.head),
        Effect.flatMap(Schema.decode(ChoresContract.Chore)),
        Effect.catchTags({
          DatabaseError: Effect.die,
          NoSuchElementException: () =>
            new ChoresContract.ChoreNotFoundError({
              message: `Chore with id ${input.id} not found`,
            }),
          ParseError: Effect.die,
        }),
        Effect.withSpan("ChoresRepository.update"),
      ),
    );

    const findAll = db.makeQuery((execute) =>
      execute((client) =>
        client.query.choresTable.findMany({
          orderBy: (chores, { desc }) => [desc(chores.createdAt)],
        }),
      ).pipe(
        Effect.flatMap(Schema.decode(Schema.Array(ChoresContract.Chore))),
        Effect.catchTags({
          DatabaseError: Effect.die,
          ParseError: Effect.die,
        }),
        Effect.withSpan("ChoresRepository.findAll"),
      ),
    );

    const del = db.makeQuery((execute, input: ChoreId) =>
      execute((client) =>
        client
          .delete(DbSchema.choresTable)
          .where(d.eq(DbSchema.choresTable.id, input))
          .returning({ id: DbSchema.choresTable.id }),
      ).pipe(
        Effect.flatMap(Array.head),
        Effect.flatMap(Schema.decode(Schema.Struct({ id: ChoreId }))),
        Effect.catchTags({
          DatabaseError: Effect.die,
          NoSuchElementException: () =>
            new ChoresContract.ChoreNotFoundError({
              message: `Chore with id ${input} not found`,
            }),
          ParseError: Effect.die,
        }),
        Effect.withSpan("ChoresRepository.del"),
      ),
    );

    return {
      create,
      del,
      findAll,
      update,
    };
  }),
}) {}
