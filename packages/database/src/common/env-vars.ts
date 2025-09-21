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
      ENV: yield* Config.literal("dev", "prod", "staging")("ENV").pipe(Config.withDefault("dev")),
      APP_URL: (yield* Config.url("APP_URL").pipe(Config.withDefault("http://localhost:5173")))
        .toString()
        .replace(TRAILING_SLASH_REGEX, "")
        .replace(PROTOCOL_REGEX, "http://"),

      // Database
      DATABASE_URL: yield* Config.redacted("DATABASE_URL"),

      // Github
      GITHUB_CLIENT_ID: yield* Config.string("GITHUB_CLIENT_ID"),
      GITHUB_CLIENT_SECRET: yield* Config.redacted("GITHUB_CLIENT_SECRET"),
    } as const;
  }),
}) {}
