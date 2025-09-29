import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { TaskCompletionId, TaskId } from "../EntityIds.js";
import { AuthMiddleware } from "../Policy.js";
import { TaskCompletion } from "./TaskCompletionContract.js";
import { Task } from "./TaskContract.js";

export class TestEvent extends Schema.TaggedClass<TestEvent>("TestEvent")("TestEvent", {
  message: Schema.String,
}) {}

export namespace TaskEvents {
  export class UpsertedTask extends Schema.TaggedClass<UpsertedTask>("UpsertedTask")(
    "UpsertedTask",
    {
      task: Task,
      optimisticId: Schema.optional(Schema.String),
    },
  ) {}

  export class DeletedTask extends Schema.TaggedClass<DeletedTask>("DeletedTask")("DeletedTask", {
    id: TaskId,
  }) {}

  export const is = (event: Events): event is UpsertedTask | DeletedTask =>
    event._tag === "UpsertedTask" || event._tag === "DeletedTask";
}

export namespace TaskCompletionEvents {
  export class UpsertedTaskCompletion extends Schema.TaggedClass<UpsertedTaskCompletion>(
    "UpsertedTaskCompletion",
  )("UpsertedTaskCompletion", {
    taskCompletion: TaskCompletion,
    optimisticId: Schema.optional(Schema.String),
  }) {}

  export class DeletedTaskCompletion extends Schema.TaggedClass<DeletedTaskCompletion>(
    "DeletedTaskCompletion",
  )("DeletedTaskCompletion", {
    id: TaskCompletionId,
  }) {}

  export const is = (event: Events): event is UpsertedTaskCompletion | DeletedTaskCompletion =>
    event._tag === "UpsertedTaskCompletion" || event._tag === "DeletedTaskCompletion";
}

export const Events = Schema.Union(
  TestEvent,
  TaskEvents.UpsertedTask,
  TaskEvents.DeletedTask,
  TaskCompletionEvents.UpsertedTaskCompletion,
  TaskCompletionEvents.DeletedTaskCompletion,
);
export type Events = typeof Events.Type;

export class Group extends HttpApiGroup.make("sse")
  .middleware(AuthMiddleware)
  .add(HttpApiEndpoint.get("connect", "/connect").addSuccess(Schema.Unknown))
  .add(HttpApiEndpoint.post("notify", "/notify").addSuccess(Schema.Void))
  .prefix("/sse") {}
