import { Database, DbSchema } from "@org/database/index";
import { UserMetadataContract } from "@org/domain/api/Contracts";
import { UserMetadataEvents } from "@org/domain/api/SseContract";
import { TaskId } from "@org/domain/EntityIds";
import { UserMetadataNotFoundError } from "@org/domain/Errors";
import * as d from "drizzle-orm";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import { SseManager } from "../sse/sse-manager.js";
import { generateLevelUpPayload } from "./utils/level.js";

export class UserMetadataRepository extends Effect.Service<UserMetadataRepository>()(
  "UserMetadataRepository",
  {
    effect: Effect.gen(function* () {
      const db = yield* Database.Database;
      const sseManager = yield* SseManager;

      const create = db.makeQuery(
        (execute, input: typeof UserMetadataContract.CreateUserMetadataPayload.Type) =>
          Effect.gen(function* () {
            return yield* execute((client) =>
              client.insert(DbSchema.userMetadata).values(input).returning(),
            );
          }).pipe(
            Effect.flatMap(Array.head),
            Effect.flatMap(Schema.decode(UserMetadataContract.UserMetadata)),
            Effect.catchTags({
              DatabaseError: Effect.die,
              NoSuchElementException: Effect.die,
              ParseError: Effect.die,
            }),
            Effect.withSpan("UserMetadataRepository.create"),
          ),
      );

      const update = db.makeQuery(
        (execute, input: typeof UserMetadataContract.UpdateUserMetadataPayload.Type) =>
          Effect.gen(function* () {
            const payload = yield* generateLevelUpPayload(input);

            return yield* execute((client) =>
              client
                .update(DbSchema.userMetadata)
                .set(payload)
                .where(d.eq(DbSchema.userMetadata.userId, input.userId))
                .returning(),
            ).pipe(
              Effect.flatMap(Array.head),
              Effect.flatMap(Schema.decode(UserMetadataContract.UserMetadata)),
              Effect.tap((userMetadata) =>
                sseManager.notifyCurrentUser(
                  new UserMetadataEvents.UpsertedUserMetadata({ userMetadata }),
                ),
              ),
              Effect.catchTags({
                DatabaseError: Effect.die,
                NoSuchElementException: () =>
                  new UserMetadataNotFoundError({
                    message: `Metadata of user with id ${input.userId} not found`,
                  }),
                ParseError: Effect.die,
              }),
              Effect.withSpan("UserMetadataRepository.update"),
            );
          }),
      );

      const findByUserId = db.makeQuery(
        (execute, input: typeof UserMetadataContract.GetByIdParams.Type) =>
          execute((client) =>
            client.query.userMetadata.findFirst({
              where: (userMetadata, { eq }) => eq(userMetadata.userId, input.userId),
            }),
          ).pipe(
            Effect.flatMap((userMetadata) => {
              if (!userMetadata)
                return Effect.fail(
                  new UserMetadataNotFoundError({
                    message: `Metadata of user with id ${input.userId} not found`,
                  }),
                );

              return Effect.succeed(userMetadata);
            }),
            Effect.flatMap(Schema.decode(UserMetadataContract.UserMetadata)),
            Effect.catchTags({
              DatabaseError: Effect.die,
              ParseError: Effect.die,
            }),
            Effect.withSpan("UserMetadataRepository.findById"),
          ),
      );

      const del = db.makeQuery(
        (execute, input: typeof UserMetadataContract.DeleteUserMetadataPayload.Type) =>
          execute((client) =>
            client
              .delete(DbSchema.userMetadata)
              .where(d.eq(DbSchema.userMetadata.userId, input.userId))
              .returning({ id: DbSchema.userMetadata.userId }),
          ).pipe(
            Effect.flatMap(Array.head),
            Effect.flatMap(Schema.decode(Schema.Struct({ id: TaskId }))),
            Effect.catchTags({
              DatabaseError: Effect.die,
              NoSuchElementException: () =>
                new UserMetadataNotFoundError({
                  message: `Metadata of user with id ${input.userId} not found`,
                }),
              ParseError: Effect.die,
            }),
            Effect.withSpan("UserMetadataRepository.delete"),
          ),
      );

      return {
        create,
        del,
        findByUserId,
        update,
      };
    }),
    dependencies: [SseManager.Default],
  },
) {}
