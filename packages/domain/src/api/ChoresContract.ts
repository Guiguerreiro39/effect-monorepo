import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as Schema from "effect/Schema";
import { ChoreId, UserId } from "../EntityIds.js";
import { AuthMiddleware } from "../Policy.js";

enum Frequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  OneTime = "one-time",
}

export class ChoreNotFoundError extends Schema.TaggedError<ChoreNotFoundError>(
  "ChoreNotFoundError",
)(
  "ChoreNotFoundError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}

export class Chore extends Schema.Class<Chore>("Chore")({
  id: ChoreId,
  title: Schema.Trim.pipe(Schema.nonEmptyString(), Schema.maxLength(200)),
  description: Schema.NullishOr(Schema.Trim.pipe(Schema.maxLength(500))),
  frequency: Schema.Enums(Frequency),
  createdBy: UserId,
}) {}

export class CreateChorePayload extends Schema.Class<CreateChorePayload>("CreateChorePayload")({
  title: Chore.fields.title,
  description: Chore.fields.description,
  frequency: Chore.fields.frequency,
  optimisticId: Schema.optional(Schema.String).annotations({
    description: "Client-generated ID for optimistic updates",
  }),
}) {}

export class UpdateChorePayload extends Schema.Class<UpdateChorePayload>("UpdateChorePayload")({
  id: ChoreId,
  title: Chore.fields.title,
  description: Chore.fields.description,
  frequency: Chore.fields.frequency,
}) {}

export class Group extends HttpApiGroup.make("chores")
  .middleware(AuthMiddleware)
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.Array(Chore)))
  .add(HttpApiEndpoint.post("create", "/").addSuccess(Chore).setPayload(CreateChorePayload))
  .add(
    HttpApiEndpoint.put("update", "/:id")
      .addError(ChoreNotFoundError)
      .addSuccess(Chore)
      .setPayload(UpdateChorePayload),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id")
      .addError(ChoreNotFoundError)
      .addSuccess(Schema.Void)
      .setPayload(ChoreId),
  )
  .prefix("/chores") {}
