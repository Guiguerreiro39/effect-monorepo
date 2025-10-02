import { QueryData, useEffectMutation, useEffectQuery } from "@/lib/tanstack-query";
import { ApiClient } from "@/services/common/api-client";
import { SseContract, type TaskCompletionContract } from "@org/domain/api/Contracts";
import type { TaskCompletionId } from "@org/domain/EntityIds";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

export namespace TaskCompletionService {
  const taskKey = QueryData.makeQueryKey("task-completion");
  const taskHelpers = QueryData.makeHelpers<Array<TaskCompletionContract.TaskCompletion>>(taskKey);

  const pendingOptimisticIds = Ref.unsafeMake(new Set<string>());

  export const useGetAllTaskCompletions = () => {
    return useEffectQuery({
      queryKey: taskKey(),
      queryFn: () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.taskCompletions.get()),
    });
  };

  export const useCreateTaskCompletion = () => {
    return useEffectMutation({
      mutationKey: ["TaskCompletionService.createTaskCompletion"],
      mutationFn: Effect.fnUntraced(function* (
        taskCompletion: Omit<TaskCompletionContract.CreateTaskCompletionPayload, "optimisticId">,
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
          .create({ payload: { ...taskCompletion, optimisticId } })
          .pipe(
            Effect.tap((createdTaskCompletion) =>
              taskHelpers.setData((draft) => {
                if (!draft.some((t) => t.id === createdTaskCompletion.id)) {
                  draft.unshift(createdTaskCompletion);
                }
              }),
            ),
          );
      }, Effect.scoped),
      toastifySuccess: () => "Task created!",
    });
  };

  export const useUpdateTaskCompletion = () => {
    return useEffectMutation({
      mutationKey: ["TaskCompletionService.updateTaskCompletion"],
      mutationFn: (taskCompletion: TaskCompletionContract.UpdateTaskCompletionPayload) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) =>
          client.taskCompletions.update({ payload: taskCompletion }),
        ).pipe(
          Effect.tap((updatedTask) =>
            taskHelpers.setData((draft) => {
              const index = draft.findIndex((t) => t.id === updatedTask.id);
              if (index !== -1) {
                draft[index] = updatedTask;
              }
            }),
          ),
        ),
      toastifySuccess: () => "Task updated!",
    });
  };

  export const useDeleteTaskCompletion = () => {
    return useEffectMutation({
      mutationKey: ["TaskCompletionService.deleteTaskCompletion"],
      mutationFn: (id: TaskCompletionId) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.taskCompletions.delete({ payload: id })).pipe(
          Effect.tap(() =>
            taskHelpers.setData((draft) => {
              const index = draft.findIndex((t) => t.id === id);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            }),
          ),
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
              yield* taskHelpers.setData((draft) => {
                const index = draft.findIndex((t) => t.id === upsertedEvent.taskCompletion.id);
                if (index !== -1) {
                  draft[index] = upsertedEvent.taskCompletion;
                } else {
                  draft.unshift(upsertedEvent.taskCompletion);
                }
              });
            }),
          ),
          Match.tag("DeletedTaskCompletion", (deletedEvent) =>
            taskHelpers.setData((draft) => {
              const index = draft.findIndex((t) => t.id === deletedEvent.id);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            }),
          ),
          Match.exhaustive,
        ),
      ),
    );
}
