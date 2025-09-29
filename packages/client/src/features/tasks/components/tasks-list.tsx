import { Card, Skeleton } from "@/components/ui";
import { TaskService } from "../api";
import { TaskItem } from "./task-item";

export const TasksList = () => {
  const { data, isLoading } = TaskService.useGetAllTasks({
    from: new Date().toISOString(),
  });

  if (isLoading) return <TaskListSkeleton />;
  if (!data || data.length === 0) return <EmptyTaskList />;

  return (
    <Card>
      <Card.Header>
        <Card.Title>My tasks</Card.Title>
      </Card.Header>
      <Card.Content className="space-y-2">
        {data.map((task) => (
          <TaskItem key={task.id} task={task} />
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
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
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
