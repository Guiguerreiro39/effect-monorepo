import { QueryData, useEffectQuery } from "@/lib/tanstack-query";
import { ApiClient } from "@/services/common/api-client";
import { SseContract, type ActivityContract } from "@org/domain/api/Contracts";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

const queryKeys = {
  getAllActivities: QueryData.makeQueryKey<string, undefined>("ActivityService.getAllActivities"),
};

const helpers = {
  getAllActivities: QueryData.makeHelpers<Array<ActivityContract.Activity>>(
    queryKeys.getAllActivities,
  ),
};

const pendingOptimisticIds = Ref.unsafeMake(new Set<string>());

export const useGetAllActivities = () => {
  const queryKey = queryKeys.getAllActivities();

  return useEffectQuery({
    queryKey,
    queryFn: () =>
      // eslint-disable-next-line react-hooks/rules-of-hooks
      ApiClient.use(({ client }) => client.activity.get()),
  });
};

export const activitySseStream = <E, R>(self: Stream.Stream<SseContract.Events, E, R>) =>
  self.pipe(
    Stream.filter(SseContract.ActivityEvents.is),
    Stream.tap((event) =>
      Match.value(event).pipe(
        Match.tag("UpsertedActivity", (upsertedEvent) =>
          Effect.gen(function* () {
            const pendingIds = yield* Ref.get(pendingOptimisticIds);
            if (
              upsertedEvent.optimisticId !== undefined &&
              pendingIds.has(upsertedEvent.optimisticId)
            ) {
              return;
            }

            // Updates cache with the newly obtained value
            yield* helpers.getAllActivities.setData((draft) => {
              const index = draft.findIndex(
                (activity) => activity.id === upsertedEvent.activity.id,
              );
              if (index !== -1) {
                draft[index] = upsertedEvent.activity;
              } else {
                draft.unshift(upsertedEvent.activity);
              }
            });
          }),
        ),
        Match.tag("DeletedActivity", (deletedEvent) =>
          Effect.gen(function* () {
            yield* helpers.getAllActivities.setData((draft) => {
              const index = draft.findIndex((activity) => activity.id === deletedEvent.id);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            });
          }),
        ),
        Match.exhaustive,
      ),
    ),
  );
