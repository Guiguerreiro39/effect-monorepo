import { Auth } from "@org/database/lib/auth";
import * as Effect from "effect/Effect";

export class AuthRepository extends Effect.Service<AuthRepository>()("AuthRepository", {
  effect: Effect.gen(function* () {
    const auth = yield* Auth;

    return {
      handler: (req: Request) => auth.instance.handler(req),
    };
  }),
  dependencies: [Auth.Default],
}) {}
