import { Card, Skeleton } from "@/components/ui";
import * as Array from "effect/Array";
import { useGetAllTasks } from "../api";
import { TaskItem } from "./task-item";

export const TasksList = () => {
  const { data: tasks, isLoading } = useGetAllTasks();

  if (isLoading) return <TaskListSkeleton />;
  if (!tasks || Array.isEmptyReadonlyArray(tasks)) return <EmptyTaskList />;

  return (
    <Card>
      <Card.Header>
        <Card.Title>My tasks</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-2">
        {tasks.map((task) => (
          <TaskItem.Root key={task.id} task={task} />
        ))}
      </Card.Content>
    </Card>
  );
};

const TaskListSkeleton = () => {
  return (
    <Card>
      <Card.Header>
        <Card.Title>
          <Skeleton className="h-6 w-60" />
        </Card.Title>
      </Card.Header>
      <Card.Content className="space-y-4">
        <TaskItem.Skeleton />
        <TaskItem.Skeleton />
        <TaskItem.Skeleton />
      </Card.Content>
    </Card>
  );
};

const EmptyTaskList = () => {
  return (
    <Card>
      <Card.Content className="h-[80px]">
        <p className="text-muted-foreground">No tasks</p>
      </Card.Content>
    </Card>
  );
};
