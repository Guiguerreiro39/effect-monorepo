import * as HttpApiSchema from "@effect/platform/HttpApiSchema";
import * as Schema from "effect/Schema";

export class TaskNotFoundError extends Schema.TaggedError<TaskNotFoundError>("TaskNotFoundError")(
  "TaskNotFoundError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}

export class TaskUpdateNotAllowed extends Schema.TaggedError<TaskUpdateNotAllowed>(
  "TaskUpdateNotAllowed",
)(
  "TaskUpdateNotAllowed",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 417,
  }),
) {}

export class ActivityNotFoundError extends Schema.TaggedError<ActivityNotFoundError>(
  "ActivityNotFoundError",
)(
  "ActivityNotFoundError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}

export class HashIdentifierError extends Schema.TaggedError<HashIdentifierError>(
  "HashIdentifierError",
)("HashIdentifierError", {
  message: Schema.String,
}) {}

export class UserMetadataNotFoundError extends Schema.TaggedError<UserMetadataNotFoundError>(
  "UserMetadataNotFoundError",
)(
  "UserMetadataNotFoundError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}
