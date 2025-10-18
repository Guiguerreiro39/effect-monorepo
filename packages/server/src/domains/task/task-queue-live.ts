import { EnvVars } from "@/common/env-vars.js";
import { diffInMilliseconds } from "@/lib/datetime-utils.js";
import { TaskContract } from "@org/domain/api/Contracts";
import type { TaskId } from "@org/domain/EntityIds";
import {
  JobQueue,
  JobQueueCancelJobError,
  JobQueueEnqueueJobError,
  JobQueueStartWorkerError,
} from "@org/domain/Queue";
import { Queue, Worker, type Job } from "bullmq";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { Redis } from "ioredis";
import { TaskRepository } from "./task-repository.js";
import { createHash } from "./utils/hash-identifier.js";

const QUEUE_NAME = "task-reschedule";
const JOB_NAME = "reschedule-task";

const make = Effect.gen(function* () {
  const envVars = yield* EnvVars;

  const redis = new Redis(envVars.REDIS_URL.toString());
  const queue = new Queue(QUEUE_NAME, { connection: redis });

  const jobIdForTask = (taskId: TaskId) => `check-task-${taskId}`;

  const enqueueDelayed = (task: TaskContract.Task, delay: number) =>
    Effect.tryPromise({
      try: () =>
        queue.add(
          JOB_NAME,
          { task },
          {
            delay: Math.max(0, delay),
            removeOnComplete: true,
            removeOnFail: 3,
            jobId: jobIdForTask(task.id),
          },
        ),
      catch: () =>
        new JobQueueEnqueueJobError({ message: "Failed to enqueue job of task id " + task.id }),
    }).pipe(Effect.tap(Effect.log("[Task Queue]: job added to the queue")));

  const cancelJob = (taskId: TaskId) =>
    Effect.tryPromise({
      try: async () => {
        const jobId = jobIdForTask(taskId);
        const job = await queue.getJob(jobId);
        const state = await job?.getState();

        if (job && (state === "waiting" || state === "delayed" || state === "failed")) {
          await job.remove();
          return;
        }

        throw new Error(`Job ${jobId} is not in a cancelable state`);
      },
      catch: (error) => new JobQueueCancelJobError({ message: `Failed to cancel job: ${error}` }),
    }).pipe(Effect.tap(Effect.log("[Task Queue]: job cancelled")));

  const updateJob = (task: TaskContract.Task, newDelay: number) =>
    pipe(
      cancelJob(task.id),
      Effect.flatMap(() => enqueueDelayed(task, newDelay)),
    );

  const startWorker = (
    processor: (job: Job<{ task: TaskContract.Task }>) => Effect.Effect<void, Error>,
  ) =>
    Effect.tryPromise({
      try: async () => {
        const worker = new Worker(
          QUEUE_NAME,
          async (job: Job<{ task: TaskContract.Task }>) => {
            // Run the Effect processor synchronously via runPromise
            await Effect.runPromise(processor(job));
          },
          { connection: { url: envVars.REDIS_URL.toString() }, concurrency: 5 }, // Adjust concurrency as needed
        );

        worker.on("completed", (job) => {
          void enqueueDelayed(
            job.data.task,
            diffInMilliseconds(new Date(), job.data.task.nextExecutionDate),
          ).pipe(Effect.runPromise);
        });

        // Worker runs indefinitely; we fork it as daemon elsewhere
        return worker;
      },
      catch: (error) =>
        new JobQueueStartWorkerError({ message: `Failed to start worker: ${error}` }),
    }).pipe(
      Effect.tap((worker) => Effect.addFinalizer(() => Effect.promise(() => worker.close()))), // Cleanup on scope exit
      Effect.tap(Effect.log("[Task Queue]: new worker started")),
      Effect.forkDaemon, // Fork as background process
    );

  return { enqueueDelayed, updateJob, cancelJob, startWorker };
}).pipe(Effect.withSpan("task.queue"));

export const TaskQueueLive = Layer.scoped(JobQueue, make).pipe(Layer.provide(EnvVars.Default));

export const TaskQueueWorkerLive = Layer.scopedDiscard(
  Effect.gen(function* () {
    const queue = yield* JobQueue;
    const taskRepository = yield* TaskRepository;

    const processJob = (job: Job<{ task: TaskContract.Task }>) =>
      Effect.gen(function* () {
        const decode = Schema.decode(TaskContract.UpdateTaskExecutionDatePayload);

        yield* taskRepository
          .updateExecutionDate(
            yield* decode({
              id: job.data.task.id,
              hashIdentifier: yield* createHash({
                title: job.data.task.title,
                executionDate: job.data.task.nextExecutionDate,
              }),
              prevExecutionDate: job.data.task.nextExecutionDate,
              isCompleted: false,
            }),
          )
          .pipe(Effect.withSpan("JobQueueWorkerLive.updateTaskExecutionDate"));
      });

    return yield* queue.startWorker(processJob);
  }),
).pipe(Layer.provide([TaskQueueLive, TaskRepository.Default]));
