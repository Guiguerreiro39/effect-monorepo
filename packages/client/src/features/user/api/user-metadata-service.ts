import { QueryData, useEffectQuery } from "@/lib/tanstack-query";
import { ApiClient } from "@/services/common/api-client";
import { SseContract, type UserMetadataContract } from "@org/domain/api/Contracts";
import type { UserId } from "@org/domain/EntityIds";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

const queryKeys = {
  getMetadataByUserId: QueryData.makeQueryKey<string, { userId: UserId }>(
    "UserMetadata.getMetadataByUserId",
  ),
};

const helpers = {
  getMetadataByUserId: QueryData.makeHelpers<UserMetadataContract.UserMetadata, { userId: UserId }>(
    queryKeys.getMetadataByUserId,
  ),
};

const pendingOptimisticIds = Ref.unsafeMake(new Set<string>());

export const useGetMetadataByUserId = (path: typeof UserMetadataContract.GetByIdParams.Type) => {
  const queryKey = queryKeys.getMetadataByUserId(path);

  return useEffectQuery({
    queryKey,
    queryFn: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ApiClient.use(({ client }) => client.userMetadata.get({ path })),
  });
};

export const userMetadataSseStream = <E, R>(self: Stream.Stream<SseContract.Events, E, R>) =>
  self.pipe(
    Stream.filter(SseContract.UserMetadataEvents.is),
    Stream.tap((event) =>
      Match.value(event).pipe(
        Match.tag("UpsertedUserMetadata", (upsertedEvent) =>
          Effect.gen(function* () {
            const pendingIds = yield* Ref.get(pendingOptimisticIds);
            if (
              upsertedEvent.optimisticId !== undefined &&
              pendingIds.has(upsertedEvent.optimisticId)
            ) {
              return;
            }

            yield* helpers.getMetadataByUserId.setData(
              { userId: upsertedEvent.userMetadata.userId },
              () => upsertedEvent.userMetadata,
            );
          }),
        ),
        Match.exhaustive,
      ),
    ),
  );
