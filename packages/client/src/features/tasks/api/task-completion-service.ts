import { QueryData, useEffectMutation, useEffectQuery } from "@/lib/tanstack-query";
import { ApiClient } from "@/services/common/api-client";
import { SseContract, type TaskCompletionContract } from "@org/domain/api/Contracts";
import type { TaskCompletionId } from "@org/domain/EntityIds";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

export namespace TaskCompletionService {
  const queryKeys = {
    getAllTaskCompletions: QueryData.makeQueryKey<
      string,
      { payload: typeof TaskCompletionContract.GetTaskCompletionPayload.Type | undefined }
    >("TaskCompletionService.getAllTaskCompletions"),
    getTaskCompletionById: QueryData.makeQueryKey<string, { id: TaskCompletionId }>(
      "TaskCompletionService.getTaskCompletionById",
    ),
  };

  const helpers = {
    getAllTaskCompletions: QueryData.makeHelpers<
      Array<TaskCompletionContract.TaskCompletion>,
      { payload: typeof TaskCompletionContract.GetTaskCompletionPayload.Type | undefined }
    >(queryKeys.getAllTaskCompletions),
    getTaskCompletionById: QueryData.makeHelpers<
      TaskCompletionContract.TaskCompletion,
      { id: TaskCompletionId }
    >(queryKeys.getTaskCompletionById),
  };

  const pendingOptimisticIds = Ref.unsafeMake(new Set<string>());

  export const useGetAllTaskCompletions = (
    payload: typeof TaskCompletionContract.GetTaskCompletionPayload.Type,
  ) => {
    const queryKey = queryKeys.getAllTaskCompletions({ payload });

    return useEffectQuery({
      queryKey,
      queryFn: () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.taskCompletions.get({ payload })),
    });
  };

  export const useCreateTaskCompletion = () => {
    return useEffectMutation({
      mutationKey: ["TaskCompletionService.createTaskCompletion"],
      mutationFn: Effect.fnUntraced(function* (
        payload: Omit<TaskCompletionContract.CreateTaskCompletionPayload, "optimisticId">,
      ) {
        const { client } = yield* ApiClient;

        const optimisticId = crypto.randomUUID();

        yield* Ref.update(pendingOptimisticIds, (set) => set.add(optimisticId));
        yield* Effect.addFinalizer(() =>
          Ref.update(pendingOptimisticIds, (set) => {
            set.delete(optimisticId);
            return set;
          }),
        );

        return yield* client.taskCompletions
          .create({ payload: { ...payload, optimisticId } })
          .pipe(Effect.tap(() => helpers.getAllTaskCompletions.refetchAllQueries()));
      }, Effect.scoped),
      toastifySuccess: () => "Task created!",
    });
  };

  export const useUpdateTaskCompletion = () => {
    return useEffectMutation({
      mutationKey: ["TaskCompletionService.updateTaskCompletion"],
      mutationFn: (payload: TaskCompletionContract.UpdateTaskCompletionPayload) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.taskCompletions.update({ payload })).pipe(
          Effect.tap(() => helpers.getAllTaskCompletions.refetchAllQueries()),
        ),
    });
  };

  export const useDeleteTaskCompletion = () => {
    return useEffectMutation({
      mutationKey: ["TaskCompletionService.deleteTaskCompletion"],
      mutationFn: (payload: typeof TaskCompletionContract.DeleteTaskCompletionPayload.Type) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.taskCompletions.delete({ payload })).pipe(
          Effect.tap(() => helpers.getAllTaskCompletions.refetchAllQueries()),
        ),
      toastifySuccess: () => "Task deleted!",
      toastifyErrors: {
        TaskCompletionNotFoundError: (error) => error.message,
      },
    });
  };

  export const stream = <E, R>(self: Stream.Stream<SseContract.Events, E, R>) =>
    self.pipe(
      Stream.filter(SseContract.TaskCompletionEvents.is),
      Stream.tap((event) =>
        Match.value(event).pipe(
          Match.tag("UpsertedTaskCompletion", (upsertedEvent) =>
            Effect.gen(function* () {
              const pendingIds = yield* Ref.get(pendingOptimisticIds);
              if (
                upsertedEvent.optimisticId !== undefined &&
                pendingIds.has(upsertedEvent.optimisticId)
              ) {
                return;
              }

              // Updates cache with the newly obtained value
              yield* helpers.getAllTaskCompletions.refetchAllQueries();
            }),
          ),
          Match.tag("DeletedTaskCompletion", () =>
            helpers.getAllTaskCompletions.refetchAllQueries(),
          ),
          Match.exhaustive,
        ),
      ),
    );
}
