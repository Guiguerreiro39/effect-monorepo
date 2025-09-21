import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import { EnvVars } from "../common/env-vars.js";
import { Database } from "../index.js";
import { DatabaseLive } from "./db.js";

export class BetterAuthApiError extends Data.TaggedError("BetterAuthApiError")<{
  readonly error: unknown;
}> {}

export class Auth extends Effect.Service<Auth>()("Auth", {
  accessors: true,
  effect: Effect.gen(function* (_) {
    const envVars = yield* EnvVars;
    const db = yield* Database.Database;

    const auth = betterAuth({
      basePath: "/auth",
      database: drizzleAdapter(db.instance, {
        provider: "pg",
      }),
      socialProviders: {
        github: {
          clientId: envVars.GITHUB_CLIENT_ID,
          clientSecret: Redacted.value(envVars.GITHUB_CLIENT_SECRET),
        },
      },
      trustedOrigins: [envVars.APP_URL],
    });

    // Build the auth instance
    return {
      instance: auth,
    };
  }),
  dependencies: [DatabaseLive, EnvVars.Default],
}) {}
