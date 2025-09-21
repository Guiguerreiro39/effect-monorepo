import * as Effect from "effect/Effect";
import { Auth } from "./auth.js";
import { DatabaseRuntime } from "./runtime.js";

export const auth = await Effect.gen(function* () {
  const betterAuth = yield* Auth;
  return betterAuth.instance;
}).pipe(DatabaseRuntime.runPromise);
