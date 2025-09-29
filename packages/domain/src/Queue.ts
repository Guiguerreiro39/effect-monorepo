import type { Job, Worker } from "bullmq";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type { RuntimeFiber } from "effect/Fiber";
import * as Schema from "effect/Schema";
import type { Scope } from "effect/Scope";
import type { TaskContract } from "./api/Contracts.js";
import type { TaskId } from "./EntityIds.js";
import type { TaskNotFoundError } from "./Errors.js";

export class JobQueueEnqueueJobError extends Schema.TaggedError<JobQueueEnqueueJobError>(
  "JobQueueEnqueueJobError",
)("JobQueueEnqueueJobError", {
  message: Schema.String,
}) {}

export class JobQueueStartWorkerError extends Schema.TaggedError<JobQueueStartWorkerError>(
  "JobQueueStartWorkerError",
)("JobQueueStartWorkerError", {
  message: Schema.String,
}) {}

export class JobQueueCancelJobError extends Schema.TaggedError<JobQueueCancelJobError>(
  "JobQueueCancelJobError",
)("JobQueueCancelJobError", {
  message: Schema.String,
}) {}

export class JobQueue extends Context.Tag("JobQueue")<
  JobQueue,
  {
    readonly enqueueDelayed: (
      task: TaskContract.Task,
      delay: number,
    ) => Effect.Effect<void, JobQueueEnqueueJobError>;
    readonly startWorker: (
      processor: (job: Job<{ task: TaskContract.Task }>) => Effect.Effect<void, TaskNotFoundError>,
    ) => Effect.Effect<
      RuntimeFiber<Worker<{ task: TaskContract.Task }, unknown, string>, JobQueueStartWorkerError>,
      never,
      Scope
    >;
    readonly cancelJob: (taskId: TaskId) => Effect.Effect<void, JobQueueCancelJobError>;
    readonly updateJob: (
      task: TaskContract.Task,
      newDelay: number,
    ) => Effect.Effect<void, JobQueueCancelJobError | JobQueueEnqueueJobError>;
  }
>() {}
