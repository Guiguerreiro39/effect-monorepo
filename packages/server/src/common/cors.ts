import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { EnvVars } from "./env-vars.js";

export const CorsLive = Layer.unwrapEffect(
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
