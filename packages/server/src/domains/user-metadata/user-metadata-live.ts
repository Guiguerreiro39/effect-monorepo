import { Api } from "@/api.js";
import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import { CurrentUser } from "@org/domain/Policy";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { UserMetadataRepository } from "./user-metadata-repository.js";

export const UserMetadataLive = HttpApiBuilder.group(
  Api,
  "userMetadata",
  Effect.fnUntraced(function* (handlers) {
    const repository = yield* UserMetadataRepository;

    return handlers
      .handle("get", (request) =>
        repository.findByUserId(request.path).pipe(Effect.withSpan("UserMetadataLive.get")),
      )
      .handle("update", (request) => {
        return Effect.gen(function* () {
          const currentUser = yield* CurrentUser;

          return yield* repository
            .update({
              experience: request.payload.experience,
              level: request.payload.level,
              userId: currentUser.userId,
            })
            .pipe(Effect.withSpan("UserMetadataLive.update"));
        });
      });
  }),
).pipe(Layer.provide([UserMetadataRepository.Default]));
