import { QueryData, useEffectMutation, useEffectQuery } from "@/lib/tanstack-query";
import { ApiClient } from "@/services/common/api-client";
import { SseContract, type TaskContract } from "@org/domain/api/Contracts";
import type { TaskId } from "@org/domain/EntityIds";
import * as Effect from "effect/Effect";
import * as Match from "effect/Match";
import * as Ref from "effect/Ref";
import * as Stream from "effect/Stream";

export namespace TaskService {
  const taskKey = QueryData.makeQueryKey("task");
  const taskHelpers = QueryData.makeHelpers<Array<TaskContract.Task>>(taskKey);

  const pendingOptimisticIds = Ref.unsafeMake(new Set<string>());

  export const useGetAllTasks = (urlParams?: typeof TaskContract.GetTasksUrlParams.Type) => {
    return useEffectQuery({
      queryKey: taskKey(),
      queryFn: () =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) =>
          client.tasks.get({
            urlParams: {
              ...urlParams,
            },
          }),
        ),
    });
  };

  export const useCreateTask = () => {
    return useEffectMutation({
      mutationKey: ["TaskService.createTask"],
      mutationFn: Effect.fnUntraced(function* (
        task: Omit<TaskContract.CreateTaskPayload, "optimisticId">,
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

        return yield* client.tasks.create({ payload: { ...task, optimisticId } }).pipe(
          Effect.tap((createdTask) =>
            taskHelpers.setData((draft) => {
              if (!draft.some((t) => t.id === createdTask.id)) {
                draft.unshift(createdTask);
              }
            }),
          ),
        );
      }, Effect.scoped),
      toastifySuccess: () => "Task created!",
    });
  };

  export const useUpdateTask = () => {
    return useEffectMutation({
      mutationKey: ["TaskService.updateTask"],
      mutationFn: (task: TaskContract.UpdateTaskPayload) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.tasks.update({ payload: task })).pipe(
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

  export const useDeleteTask = () => {
    return useEffectMutation({
      mutationKey: ["TaskService.deleteTask"],
      mutationFn: (id: TaskId) =>
        // eslint-disable-next-line react-hooks/rules-of-hooks
        ApiClient.use(({ client }) => client.tasks.delete({ payload: id })).pipe(
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
        TaskNotFoundError: (error) => error.message,
      },
    });
  };

  export const stream = <E, R>(self: Stream.Stream<SseContract.Events, E, R>) =>
    self.pipe(
      Stream.filter(SseContract.TaskEvents.is),
      Stream.tap((event) =>
        Match.value(event).pipe(
          Match.tag("UpsertedTask", (upsertedEvent) =>
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
                const index = draft.findIndex((t) => t.id === upsertedEvent.task.id);
                if (index !== -1) {
                  draft[index] = upsertedEvent.task;
                } else {
                  draft.unshift(upsertedEvent.task);
                }
              });
            }),
          ),
          Match.tag("DeletedTask", (deletedEvent) =>
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
