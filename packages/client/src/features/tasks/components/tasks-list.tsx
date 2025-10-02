import { Card, Skeleton } from "@/components/ui";
import { TaskCompletionService } from "../api";
import { TaskItem } from "./task-item";

export const TasksList = () => {
  const { data, isLoading } = TaskCompletionService.useGetAllTaskCompletions();

  if (isLoading) return <TaskListSkeleton />;
  if (!data || data.length === 0) return <EmptyTaskList />;

  return (
    <Card>
      <Card.Header>
        <Card.Title>My tasks</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-2">
        {data.map((taskCompletion) => (
          <TaskItem.Root key={taskCompletion.id} taskCompletion={taskCompletion} />
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
