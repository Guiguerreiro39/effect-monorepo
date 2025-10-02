import { Badge, Button, Card, Checkbox, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { TaskCompletion } from "@org/domain/api/TaskCompletionContract";
import { FlameIcon, PencilIcon } from "lucide-react";
import React from "react";
import { TaskService } from "../api";
import { EditTaskDialog } from "./edit-task-dialog";

export const TaskItemRoot = ({ taskCompletion }: { taskCompletion: TaskCompletion }) => {
  const [checked, setChecked] = React.useState(false);
  const { data: task, isLoading } = TaskService.useGetTaskById({ id: taskCompletion.taskId });

  if (isLoading) return <TaskItemSkeleton />;
  if (!task) return null;

  return (
    <Card>
      <label
        htmlFor={`checkbox-${taskCompletion.id}`}
        onClick={() => {
          setChecked((prev) => !prev);
        }}
        className="w-full"
      >
        <Card.Content className="grid grid-cols-2 gap-4 px-4 py-2">
          <div className="flex items-center gap-4">
            <Checkbox
              id={`checkbox-${taskCompletion.id}`}
              checked={checked}
              onCheckedChange={(value) => {
                setChecked(Boolean(value));
              }}
              className="size-5 rounded-full border-border data-[state=checked]:border-success-foreground data-[state=checked]:bg-success data-[state=checked]:text-success-foreground"
            />
            <h3 className={cn("text-lg font-medium", checked && "line-through")}>{task.title}</h3>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Badge variant="outline">{task.frequency}</Badge>
            <Badge variant="primary">
              <FlameIcon className="size-4" /> 4
            </Badge>
            <Badge variant="success">{taskCompletion.experience} XP</Badge>
            <hr />
            <EditTaskDialog task={task}>
              <Button variant="outline">
                <PencilIcon />
              </Button>
            </EditTaskDialog>
          </div>
        </Card.Content>
      </label>
    </Card>
  );
};

const TaskItemSkeleton = () => (
  <Card>
    <Card.Content className="grid grid-cols-2 gap-4 px-4 py-2">
      <div className="flex items-center gap-4">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-8 w-12" />
        <Skeleton className="h-8 w-12" />
      </div>
    </Card.Content>
  </Card>
);

export const TaskItem = {
  Root: TaskItemRoot,
  Skeleton: TaskItemSkeleton,
};
