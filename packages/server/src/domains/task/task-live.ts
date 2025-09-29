import { Api } from "@/api.js";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import { SseContract } from "@org/domain/api/Contracts";
import { CurrentUser } from "@org/domain/Policy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { SseManager } from "../sse/sse-manager.js";
import { TaskRepository } from "./task-repository.js";

export const TaskLive = HttpApiBuilder.group(
  Api,
  "tasks",
  Effect.fnUntraced(function* (handlers) {
    const repository = yield* TaskRepository;
    const sseManager = yield* SseManager;

    return handlers
      .handle("get", (request) =>
        repository.findAll(request.urlParams).pipe(Effect.withSpan("TaskLive.get")),
      )
      .handle("create", (request) => {
        return Effect.gen(function* () {
          const currentUser = yield* CurrentUser;

          return yield* repository
            .create({
              title: request.payload.title,
              description: request.payload.description,
              frequency: request.payload.frequency,
              experience: request.payload.experience,
              createdBy: currentUser.userId,
            })
            .pipe(
              Effect.tap((task) =>
                sseManager.notifyCurrentUser(new SseContract.TaskEvents.UpsertedTask({ task })),
              ),
              Effect.withSpan("TaskLive.create"),
            );
        });
      })
      .handle("update", (request) =>
        repository.update(request.payload).pipe(
          Effect.tap((task) =>
            sseManager.notifyCurrentUser(new SseContract.TaskEvents.UpsertedTask({ task })),
          ),
          Effect.withSpan("TaskLive.update"),
        ),
      )
      .handle("delete", (request) =>
        repository.del(request.payload).pipe(
          Effect.tap((task) =>
            sseManager.notifyCurrentUser(new SseContract.TaskEvents.DeletedTask({ id: task.id })),
          ),
          Effect.withSpan("TaskLive.delete"),
        ),
      );
  }),
).pipe(Layer.provide([TaskRepository.Default, SseManager.Default]));
