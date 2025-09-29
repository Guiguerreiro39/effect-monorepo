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

export class TaskCompletionNotFoundError extends Schema.TaggedError<TaskCompletionNotFoundError>(
  "TaskCompletionNotFoundError",
)(
  "TaskCompletionNotFoundError",
  {
    message: Schema.String,
  },
  HttpApiSchema.annotations({
    status: 404,
  }),
) {}
