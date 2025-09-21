import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { ChoreId, TodoId } from "../EntityIds.js";
import { AuthMiddleware } from "../Policy.js";
import { Chore } from "./ChoresContract.js";
import { Todo } from "./TodosContract.js";

export class TestEvent extends Schema.TaggedClass<TestEvent>("TestEvent")("TestEvent", {
  message: Schema.String,
}) {}

export namespace Todos {
  export class UpsertedTodo extends Schema.TaggedClass<UpsertedTodo>("UpsertedTodo")(
    "UpsertedTodo",
    {
      todo: Todo,
      optimisticId: Schema.optional(Schema.String),
    },
  ) {}

  export class DeletedTodo extends Schema.TaggedClass<DeletedTodo>("DeletedTodo")("DeletedTodo", {
    id: TodoId,
  }) {}

  export const is = (event: Events): event is UpsertedTodo | DeletedTodo =>
    event._tag === "UpsertedTodo" || event._tag === "DeletedTodo";
}

export namespace Chores {
  export class UpsertedChore extends Schema.TaggedClass<UpsertedChore>("UpsertedChore")(
    "UpsertedChore",
    {
      chore: Chore,
      optimisticId: Schema.optional(Schema.String),
    },
  ) {}

  export class DeletedChore extends Schema.TaggedClass<DeletedChore>("DeletedChore")(
    "DeletedChore",
    {
      id: ChoreId,
    },
  ) {}

  export const is = (event: Events): event is UpsertedChore | DeletedChore =>
    event._tag === "UpsertedChore" || event._tag === "DeletedChore";
}

export const Events = Schema.Union(
  TestEvent,
  Todos.UpsertedTodo,
  Todos.DeletedTodo,
  Chores.UpsertedChore,
  Chores.DeletedChore,
);
export type Events = typeof Events.Type;

export class Group extends HttpApiGroup.make("sse")
  .middleware(AuthMiddleware)
  .add(HttpApiEndpoint.get("connect", "/connect").addSuccess(Schema.Unknown))
  .add(HttpApiEndpoint.post("notify", "/notify").addSuccess(Schema.Void))
  .prefix("/sse") {}
