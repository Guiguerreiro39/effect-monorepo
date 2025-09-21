import { Api } from "@/api.js";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import { SseContract } from "@org/domain/api/Contracts";
import { CurrentUser } from "@org/domain/Policy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SseManager } from "../sse/sse-manager.js";
import { ChoresRepository } from "./chores-repository.js";

export const ChoresLive = HttpApiBuilder.group(
  Api,
  "chores",
  Effect.fnUntraced(function* (handlers) {
    const repository = yield* ChoresRepository;
    const sseManager = yield* SseManager;

    return handlers
      .handle("get", () => repository.findAll().pipe(Effect.withSpan("ChoresLive.get")))
      .handle("create", (request) => {
        return Effect.gen(function* () {
          const currentUser = yield* CurrentUser;

          return yield* repository
            .create({
              title: request.payload.title,
              description: request.payload.description,
              frequency: request.payload.frequency,
              createdBy: currentUser.userId,
            })
            .pipe(
              Effect.tap((chore) =>
                sseManager.notifyCurrentUser(
                  new SseContract.Chores.UpsertedChore({
                    chore,
                    optimisticId: request.payload.optimisticId,
                  }),
                ),
              ),
              Effect.withSpan("ChoresLive.create"),
            );
        });
      })
      .handle("update", (request) =>
        repository.update(request.payload).pipe(
          Effect.tap((chore) =>
            sseManager.notifyCurrentUser(new SseContract.Chores.UpsertedChore({ chore })),
          ),
          Effect.withSpan("ChoresLive.update"),
        ),
      )
      .handle("delete", (request) =>
        repository.del(request.payload).pipe(
          Effect.tap((chore) =>
            sseManager.notifyCurrentUser(new SseContract.Chores.DeletedChore({ id: chore.id })),
          ),
          Effect.withSpan("ChoresLive.delete"),
        ),
      );
  }),
).pipe(Layer.provide([ChoresRepository.Default, SseManager.Default]));
