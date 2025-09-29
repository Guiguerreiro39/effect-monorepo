import { Api } from "@/api.js";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import { SseContract } from "@org/domain/api/Contracts";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SseManager } from "../sse/sse-manager.js";
import { TaskCompletionRepository } from "./task-completion-repository.js";

export const TaskCompletionLive = HttpApiBuilder.group(
  Api,
  "taskCompletions",
  Effect.fnUntraced(function* (handlers) {
    const repository = yield* TaskCompletionRepository;
    const sseManager = yield* SseManager;

    return handlers
      .handle("get", () => repository.findAll().pipe(Effect.withSpan("TaskCompletionLive.get")))
      .handle("create", (request) =>
        repository.create(request.payload).pipe(
          Effect.tap((taskCompletion) =>
            sseManager.notifyCurrentUser(
              new SseContract.TaskCompletionEvents.UpsertedTaskCompletion({
                taskCompletion,
              }),
            ),
          ),
          Effect.withSpan("TaskCompletionLive.create"),
        ),
      )
      .handle("update", (request) =>
        repository.update(request.payload).pipe(
          Effect.tap((taskCompletion) =>
            sseManager.notifyCurrentUser(
              new SseContract.TaskCompletionEvents.UpsertedTaskCompletion({ taskCompletion }),
            ),
          ),
          Effect.withSpan("TaskCompletionLive.update"),
        ),
      )
      .handle("delete", (request) =>
        repository.del(request.payload).pipe(
          Effect.tap((taskCompletion) =>
            sseManager.notifyCurrentUser(
              new SseContract.TaskCompletionEvents.DeletedTaskCompletion({ id: taskCompletion.id }),
            ),
          ),
          Effect.withSpan("TaskCompletionLive.delete"),
        ),
      );
  }),
).pipe(Layer.provide([TaskCompletionRepository.Default, SseManager.Default]));
