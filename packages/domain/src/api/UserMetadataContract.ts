import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as Schema from "effect/Schema";
import { UserId, UserMetadataId } from "../EntityIds.js";
import { UserMetadataNotFoundError } from "../Errors.js";
import { AuthMiddleware } from "../Policy.js";

export class UserMetadata extends Schema.Class<UserMetadata>("UserMetadata")({
  id: UserMetadataId,
  userId: UserId,

  experience: Schema.Number.pipe(Schema.nonNegative()),
  currentLevelExperience: Schema.Number.pipe(Schema.nonNegative()),
  level: Schema.Number.pipe(Schema.greaterThan(0)),
}) {}

export class CreateUserMetadataPayload extends Schema.Class<CreateUserMetadataPayload>(
  "CreateUserMetadataPayload",
)({
  userId: UserId,
}) {}

export class UpdateUserMetadataPayload extends Schema.Class<UpdateUserMetadataPayload>(
  "UpdateUserMetadataPayload",
)({
  userId: UserId,
  experience: Schema.optional(Schema.Number.pipe(Schema.nonNegative())),
  currentLevelExperience: Schema.optional(Schema.Number.pipe(Schema.nonNegative())),
  level: Schema.optional(Schema.Number.pipe(Schema.greaterThan(0))),
}) {}

export class GetByIdParams extends Schema.Class<GetByIdParams>("GetByIdParams")({
  userId: UserId,
}) {}

export class DeleteUserMetadataPayload extends Schema.Class<DeleteUserMetadataPayload>(
  "DeleteUserMetadataPayload",
)({
  userId: UserId,
}) {}

export class Group extends HttpApiGroup.make("userMetadata")
  .middleware(AuthMiddleware)
  .add(
    HttpApiEndpoint.get("get", "/:userId")
      .addSuccess(UserMetadata)
      .setPath(GetByIdParams)
      .addError(UserMetadataNotFoundError),
  )
  .add(
    HttpApiEndpoint.put("update", "/:userId")
      .addError(UserMetadataNotFoundError)
      .addSuccess(UserMetadata)
      .setPayload(UpdateUserMetadataPayload),
  )
  .prefix("/user/metadata") {}
