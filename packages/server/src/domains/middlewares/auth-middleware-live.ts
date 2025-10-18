import * as HttpServerRequest from "@effect/platform/HttpServerRequest";
import { Auth } from "@org/database/lib/auth";
import { UserMetadataContract } from "@org/domain/api/Contracts";
import { UserId } from "@org/domain/EntityIds";
import { AuthMiddleware, Permission } from "@org/domain/Policy";
import * as CustomHttpApiError from "@org/domain/src/CustomHttpApiError.js";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import { UserMetadataRepository } from "../user-metadata/user-metadata-repository.js";

const CurrentUserSchema = Schema.Struct({
  sessionId: Schema.String,
  userId: UserId,
  permissions: Schema.Set(Permission),
  metadata: UserMetadataContract.UserMetadata,
});

const make = Effect.gen(function* () {
  const auth = yield* Auth;
  const userMetadataRepository = yield* UserMetadataRepository;

  return Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;

    const session = yield* Effect.tryPromise({
      try: () => auth.instance.api.getSession({ headers: new Headers(request.headers) }),
      catch: () => new CustomHttpApiError.Unauthorized(),
    }).pipe(Effect.tapError(Effect.logError));

    if (!session) return yield* new CustomHttpApiError.Unauthorized();

    const userId = UserId.make(session.session.userId);

    const metadata = yield* userMetadataRepository
      .findByUserId({
        userId,
      })
      .pipe(
        Effect.catchTags({
          UserMetadataNotFoundError: () =>
            userMetadataRepository.create({
              userId,
            }),
        }),
      );

    return CurrentUserSchema.make({
      sessionId: session.session.id,
      userId,
      permissions: new Set(),
      metadata,
    });
  });
}).pipe(Effect.withSpan("auth.middleware"));

export const AuthMiddlewareLive = Layer.effect(AuthMiddleware, make).pipe(
  Layer.provide([Auth.Default, UserMetadataRepository.Default]),
);
