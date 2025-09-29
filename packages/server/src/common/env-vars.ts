import * as dotenv from "dotenv";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";

const TRAILING_SLASH_REGEX = /\/+$/;
const PROTOCOL_REGEX = /(https?:\/\/)+/;

dotenv.config({
  path: "../../.env",
});

export class EnvVars extends Effect.Service<EnvVars>()("EnvVars", {
  accessors: true,
  effect: Effect.gen(function* () {
    return {
      // Server
      PORT: yield* Config.integer("PORT").pipe(Config.withDefault(3000)),
      ENV: yield* Config.literal("dev", "prod", "staging")("ENV").pipe(Config.withDefault("dev")),
      REDIS_URL: yield* Config.url("REDIS_URL"),
      APP_URL: (yield* Config.url("APP_URL").pipe(Config.withDefault("http://localhost:5173")))
        .toString()
        .replace(TRAILING_SLASH_REGEX, "")
        .replace(PROTOCOL_REGEX, "http://"),

      // Observability
      OTLP_URL: yield* Config.url("OTLP_URL").pipe(
        Config.withDefault("http://jaeger:4318/v1/traces"),
      ),
    } as const;
  }),
}) {}
