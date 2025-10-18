import { Api } from "@/api.js";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import { SseContract } from "@org/domain/api/Contracts";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SseManager } from "../sse/sse-manager.js";
import { ActivityRepository } from "./activity-repository.js";

export const ActivityLive = HttpApiBuilder.group(
  Api,
  "activity",
  Effect.fnUntraced(function* (handlers) {
    const repository = yield* ActivityRepository;
    const sseManager = yield* SseManager;

    return handlers
      .handle("get", () => repository.findMany().pipe(Effect.withSpan("ActivityLive.get")))
      .handle("create", (request) =>
        repository.create(request.payload).pipe(Effect.withSpan("ActivityLive.create")),
      )
      .handle("update", (request) =>
        repository.update(request.payload).pipe(
          Effect.tap((activity) =>
            sseManager.notifyCurrentUser(
              new SseContract.ActivityEvents.UpsertedActivity({ activity }),
            ),
          ),
          Effect.withSpan("ActivityLive.update"),
        ),
      )
      .handle("delete", (request) =>
        repository.del(request.payload).pipe(Effect.withSpan("ActivityLive.delete")),
      );
  }),
).pipe(Layer.provide([ActivityRepository.Default, SseManager.Default]));
