import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { ActivityId, TaskId, UserId } from "../EntityIds.js";
import { ActivityType, TaskActivityStatus } from "../Enums.js";
import { ActivityNotFoundError } from "../Errors.js";
import { AuthMiddleware } from "../Policy.js";
import { DateFromStringOrSelf } from "../SchemaUtils.js";

export class Activity extends Schema.Class<Activity>("Activity")({
  id: ActivityId,
  taskId: Schema.NullishOr(TaskId),
  status: Schema.NullishOr(Schema.Enums(TaskActivityStatus)),
  experience: Schema.NullishOr(Schema.Number.pipe(Schema.nonNegative(), Schema.lessThan(500))),
  title: Schema.NullishOr(Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(200))),
  completedBy: Schema.NullishOr(UserId),
  level: Schema.NullishOr(Schema.Number.pipe(Schema.nonNegative())),
  type: Schema.Enums(ActivityType),
  hashIdentifier: Schema.NullishOr(Schema.String),
  createdAt: DateFromStringOrSelf,
}) {}

export class CreateActivityPayload extends Schema.Class<CreateActivityPayload>(
  "CreateActivityPayload",
)({
  taskId: Schema.optional(Activity.fields.taskId),
  status: Schema.optional(Activity.fields.status),
  experience: Schema.optional(Activity.fields.experience),
  title: Schema.optional(Activity.fields.title),
  completedBy: Schema.optional(Activity.fields.completedBy),
  level: Schema.optional(Activity.fields.level),
  type: Activity.fields.type,
  hashIdentifier: Schema.optional(Activity.fields.hashIdentifier),
  optimisticId: Schema.optional(Schema.String).annotations({
    description: "Client-generated ID for optimistic updates",
  }),
}) {}

export class UpdateActivityPayload extends Schema.Class<UpdateActivityPayload>(
  "UpdateActivityPayload",
)({
  id: Activity.fields.id,
  status: Schema.optional(Activity.fields.status),
  experience: Schema.optional(Activity.fields.experience),
  completedBy: Schema.optional(Activity.fields.completedBy),
  level: Schema.optional(Activity.fields.level),
  hashIdentifier: Schema.optional(Activity.fields.hashIdentifier),
}) {}

export class DeleteActivityPayload extends Schema.Class<DeleteActivityPayload>(
  "DeleteActivityPayload",
)({
  id: Activity.fields.id,
}) {}

export class FindByHashIdentifierPayload extends Schema.Class<FindByHashIdentifierPayload>(
  "FindByHashIdentifierPayload",
)({
  hashIdentifier: Schema.String,
}) {}

// export class GetActivityPayload extends Schema.Class<GetActivityPayload>(
//   "GetActivityPayload",
// )({
//   taskId: Schema.optional(Activity.fields.taskId),
//   type: Schema.optional(Activity.fields.type),
// }) {}

export class Group extends HttpApiGroup.make("activity")
  .middleware(AuthMiddleware)
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.Array(Activity)))
  .add(HttpApiEndpoint.post("create", "/").addSuccess(Activity).setPayload(CreateActivityPayload))
  .add(
    HttpApiEndpoint.put("update", "/:id")
      .addError(ActivityNotFoundError)
      .addSuccess(Activity)
      .setPayload(UpdateActivityPayload),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id")
      .addError(ActivityNotFoundError)
      .addSuccess(Schema.Void)
      .setPayload(DeleteActivityPayload),
  )
  .prefix("/activity") {}
