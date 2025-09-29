import * as Schema from "effect/Schema";

export const UserId = Schema.String.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export const TaskId = Schema.String.pipe(Schema.brand("TaskId"));
export type TaskId = typeof TaskId.Type;

export const TaskCompletionId = Schema.String.pipe(Schema.brand("TaskCompletionId"));
export type TaskCompletionId = typeof TaskCompletionId.Type;
