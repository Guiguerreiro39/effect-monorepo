import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { TaskCompletionId, TaskId, UserId } from "../EntityIds.js";
import { TaskCompletionStatus } from "../Enums.js";
import { TaskCompletionNotFoundError } from "../Errors.js";
import { AuthMiddleware } from "../Policy.js";

export class TaskCompletion extends Schema.Class<TaskCompletion>("TaskCompletion")({
  id: TaskCompletionId,
  taskId: TaskId,
  completedBy: Schema.NullishOr(UserId),
  status: Schema.Enums(TaskCompletionStatus),
  experience: Schema.Number.pipe(Schema.nonNegative(), Schema.lessThan(500)),
}) {}

export class CreateTaskCompletionPayload extends Schema.Class<CreateTaskCompletionPayload>(
  "CreateTaskCompletionPayload",
)({
  taskId: TaskId,
  experience: TaskCompletion.fields.experience,
  optimisticId: Schema.optional(Schema.String).annotations({
    description: "Client-generated ID for optimistic updates",
  }),
}) {}

export class UpdateTaskCompletionPayload extends Schema.Class<UpdateTaskCompletionPayload>(
  "UpdateTaskCompletionPayload",
)({
  id: TaskCompletion.fields.id,
  completedBy: Schema.optional(TaskCompletion.fields.completedBy),
  status: Schema.optional(TaskCompletion.fields.status),
  experience: Schema.optional(TaskCompletion.fields.experience),
}) {}

export class Group extends HttpApiGroup.make("taskCompletions")
  .middleware(AuthMiddleware)
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.Array(TaskCompletion)))
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(TaskCompletion)
      .setPayload(CreateTaskCompletionPayload),
  )
  .add(
    HttpApiEndpoint.put("update", "/:id")
      .addError(TaskCompletionNotFoundError)
      .addSuccess(TaskCompletion)
      .setPayload(UpdateTaskCompletionPayload),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id")
      .addError(TaskCompletionNotFoundError)
      .addSuccess(Schema.Void)
      .setPayload(TaskCompletionId),
  )
  .prefix("/tasks/completions") {}
