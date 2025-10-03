import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServer from "@effect/platform/HttpServer";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Database } from "@org/database/index";
import { DatabaseLive } from "@org/database/lib/db";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schedule from "effect/Schedule";
import { createServer } from "node:http";
import { Api } from "./api.js";
import { CorsLive } from "./common/cors.js";
import { EnvVars } from "./common/env-vars.js";
import { AuthLive } from "./domains/auth/auth-live.js";
import { AuthMiddlewareLive } from "./domains/middlewares/auth-middleware-live.js";
import { SseLive } from "./domains/sse/sse-live.js";
import { TaskCompletionLive } from "./domains/task-completion/task-completion-live.js";
import { TaskLive } from "./domains/task/task-live.js";
import { TaskQueueLive, TaskQueueWorkerLive } from "./domains/task/task-queue-live.js";

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.merge(TaskQueueWorkerLive),
  Layer.provide([SseLive, AuthLive, TaskLive, TaskCompletionLive]),
  Layer.provide([AuthMiddlewareLive]),
  Layer.provide([TaskQueueLive]),
);

const NodeSdkLive = Layer.unwrapEffect(
  EnvVars.OTLP_URL.pipe(
    Effect.map((url) =>
      NodeSdk.layer(() => ({
        resource: {
          serviceName: "effect-monorepo-server",
        },
        spanProcessor: new BatchSpanProcessor(
          new OTLPTraceExporter({
            url: url.toString(),
          }),
        ),
      })),
    ),
  ),
);

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  HttpServer.withLogAddress,
  Layer.provide(CorsLive),
  Layer.provide(ApiLive),
  Layer.merge(Layer.effectDiscard(Database.Database.use((db) => db.setupConnectionListeners))),
  Layer.provide(DatabaseLive),
  Layer.provide(NodeSdkLive),
  Layer.provide(EnvVars.Default),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);

Layer.launch(HttpLive).pipe(
  Effect.tapErrorCause(Effect.logError),
  Effect.retry({
    while: (error) => error._tag === "DatabaseConnectionLostError",
    schedule: Schedule.exponential("1 second", 2).pipe(
      Schedule.modifyDelay(Duration.min("8 seconds")),
      Schedule.jittered,
      Schedule.repetitions,
      Schedule.modifyDelayEffect((count, delay) =>
        Effect.as(
          Effect.logError(
            `[Server crashed]: Retrying in ${Duration.format(delay)} (attempt #${count + 1})`,
          ),
          delay,
        ),
      ),
    ),
  }),
  NodeRuntime.runMain(),
);
