import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { TaskId, UserId } from "../EntityIds.js";
import { TaskFrequency } from "../Enums.js";
import { TaskNotFoundError } from "../Errors.js";
import { AuthMiddleware } from "../Policy.js";
import { DateFromStringOrSelf } from "../SchemaUtils.js";

export class Task extends Schema.Class<Task>("Task")({
  id: TaskId,
  title: Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(200)),
  description: Schema.NullishOr(Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(500))),
  frequency: Schema.Enums(TaskFrequency),
  experience: Schema.Number.pipe(Schema.nonNegative(), Schema.lessThan(500)),
  createdBy: UserId,
  nextExecutionDate: DateFromStringOrSelf,
  prevExecutionDate: DateFromStringOrSelf,
}) {}

export class CreateTaskPayload extends Schema.Class<CreateTaskPayload>("CreateTaskPayload")({
  title: Task.fields.title,
  description: Task.fields.description,
  frequency: Task.fields.frequency,
  experience: Task.fields.experience,
  optimisticId: Schema.optional(Schema.String).annotations({
    description: "Client-generated ID for optimistic updates",
  }),
}) {}

export class UpdateTaskPayload extends Schema.Class<UpdateTaskPayload>("UpdateTaskPayload")({
  id: TaskId,
  title: Schema.optional(Task.fields.title),
  description: Schema.optional(Task.fields.description),
  frequency: Schema.optional(Task.fields.frequency),
  experience: Schema.optional(Task.fields.experience),
}) {}

export class UpdateTaskExecutionDatePayload extends Schema.Class<UpdateTaskExecutionDatePayload>(
  "UpdateTaskExecutionDatePayload",
)({
  id: TaskId,
  nextExecutionDate: Task.fields.nextExecutionDate,
  prevExecutionDate: Task.fields.prevExecutionDate,
}) {}

export class GetTasksUrlParams extends Schema.Class<GetTasksUrlParams>("GetTasksUrlParams")({
  from: Schema.optional(Schema.String),
}) {}

export class Group extends HttpApiGroup.make("tasks")
  .middleware(AuthMiddleware)
  .add(
    HttpApiEndpoint.get("get", "/").addSuccess(Schema.Array(Task)).setUrlParams(GetTasksUrlParams),
  )
  .add(HttpApiEndpoint.post("create", "/").addSuccess(Task).setPayload(CreateTaskPayload))
  .add(
    HttpApiEndpoint.put("update", "/:id")
      .addError(TaskNotFoundError)
      .addSuccess(Task)
      .setPayload(UpdateTaskPayload),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id")
      .addError(TaskNotFoundError)
      .addSuccess(Schema.Void)
      .setPayload(TaskId),
  )
  .prefix("/tasks") {}
