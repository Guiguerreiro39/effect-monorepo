import * as Schema from "effect/Schema";

export const UserId = Schema.String.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export const TaskId = Schema.String.pipe(Schema.brand("TaskId"));
export type TaskId = typeof TaskId.Type;

export const ActivityId = Schema.String.pipe(Schema.brand("ActivityId"));
export type ActivityId = typeof ActivityId.Type;

export const UserMetadataId = Schema.String.pipe(Schema.brand("UserMetadataId"));
export type UserMetadataId = typeof UserMetadataId.Type;
