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
import { EnvVars } from "./common/env-vars.js";
import { AuthLive } from "./domains/auth/auth-live.js";
import { ChoresLive } from "./domains/chores/chores-live.js";
import { AuthMiddlewareLive } from "./domains/middlewares/auth-middleware-live.js";
import { SseLive } from "./domains/sse/sse-live.js";
import { TodosLive } from "./domains/todos/todos-live.js";

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide([TodosLive, SseLive, AuthLive, ChoresLive, AuthMiddlewareLive]),
  Layer.provide([AuthMiddlewareLive]),
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

const CorsLive = Layer.unwrapEffect(
  EnvVars.pipe(
    Effect.map((envVars) =>
      HttpApiBuilder.middlewareCors({
        allowedOrigins: [envVars.APP_URL],
        allowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "B3", "traceparent"],
        credentials: true,
      }),
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
