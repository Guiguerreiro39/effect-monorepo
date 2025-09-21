import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { Auth } from "@org/database/lib/auth";
import { UserId } from "@org/domain/EntityIds";
import { AuthMiddleware, Permission } from "@org/domain/Policy";
import * as CustomHttpApiError from "@org/domain/src/CustomHttpApiError.js";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";

const CurrentUserSchema = Schema.Struct({
  sessionId: Schema.String,
  userId: UserId,
  permissions: Schema.Set(Permission),
});

const make = Effect.gen(function* () {
  const auth = yield* Auth;

  return Effect.gen(function* () {
    const req = yield* HttpServerRequest.HttpServerRequest;

    const session = yield* Effect.tryPromise({
      try: () => auth.instance.api.getSession({ headers: new Headers(req.headers) }),
      catch: () => new CustomHttpApiError.Unauthorized(),
    }).pipe(Effect.tapError(Effect.logError));

    if (!session) return yield* new CustomHttpApiError.Unauthorized();

    const userId = UserId.make(session.session.userId);

    return CurrentUserSchema.make({
      sessionId: session.session.id,
      userId,
      permissions: new Set(),
    });
  });
}).pipe(Effect.withSpan("auth.middleware"));

export const AuthMiddlewareLive = Layer.effect(AuthMiddleware, make).pipe(
  Layer.provide(Auth.Default),
);
