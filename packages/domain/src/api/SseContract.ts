import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { ActivityId, TaskId } from "../EntityIds.js";
import { AuthMiddleware } from "../Policy.js";
import { Activity } from "./ActivityContract.js";
import { Task } from "./TaskContract.js";
import { UserMetadata } from "./UserMetadataContract.js";

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

export namespace ActivityEvents {
  export class UpsertedActivity extends Schema.TaggedClass<UpsertedActivity>("UpsertedActivity")(
    "UpsertedActivity",
    {
      activity: Activity,
      optimisticId: Schema.optional(Schema.String),
    },
  ) {}

  export class DeletedActivity extends Schema.TaggedClass<DeletedActivity>("DeletedActivity")(
    "DeletedActivity",
    {
      id: ActivityId,
    },
  ) {}

  export const is = (event: Events): event is UpsertedActivity | DeletedActivity =>
    event._tag === "UpsertedActivity" || event._tag === "DeletedActivity";
}

export namespace UserMetadataEvents {
  export class UpsertedUserMetadata extends Schema.TaggedClass<UpsertedUserMetadata>(
    "UpsertedUserMetadata",
  )("UpsertedUserMetadata", {
    userMetadata: UserMetadata,
    optimisticId: Schema.optional(Schema.String),
  }) {}

  export const is = (event: Events): event is UpsertedUserMetadata =>
    event._tag === "UpsertedUserMetadata";
}

export const Events = Schema.Union(
  TestEvent,
  TaskEvents.UpsertedTask,
  TaskEvents.DeletedTask,
  ActivityEvents.UpsertedActivity,
  ActivityEvents.DeletedActivity,
  UserMetadataEvents.UpsertedUserMetadata,
);
export type Events = typeof Events.Type;

export class Group extends HttpApiGroup.make("sse")
  .middleware(AuthMiddleware)
  .add(HttpApiEndpoint.get("connect", "/connect").addSuccess(Schema.Unknown))
  .add(HttpApiEndpoint.post("notify", "/notify").addSuccess(Schema.Void))
  .prefix("/sse") {}
