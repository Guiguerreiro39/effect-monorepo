import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { EnvVars } from "../common/env-vars.js";
import { Database } from "../index.js";

export const DatabaseLive = Layer.unwrapEffect(
  EnvVars.pipe(
    Effect.map((envVars) =>
      Database.layer({
        url: envVars.DATABASE_URL,
        ssl: envVars.ENV === "prod",
      }),
    ),
  ),
).pipe(Layer.provide(EnvVars.Default));
