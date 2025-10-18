import { Badge, Button, Card, Checkbox, Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { type TaskContract } from "@org/domain/api/Contracts";
import { FlameIcon, PencilIcon } from "lucide-react";
import React from "react";
import { useUpdateTask } from "../api";
import { EditTaskDialog } from "./edit-task-dialog";

export const TaskItemRoot = ({ task }: { task: TaskContract.Task }) => {
  const [checked, setChecked] = React.useState(task.isCompleted);

  const updateTask = useUpdateTask();

  const handleUpdateTaskCompletion = (isCompleted: boolean) => {
    updateTask.mutate({
      id: task.id,
      isCompleted,
    });
  };

  return (
    <Card>
      <label htmlFor={`checkbox-${task.id}`} className="w-full">
        <Card.Content className="grid grid-cols-2 gap-4 px-4 py-2">
          <div className="flex items-center gap-4">
            <Checkbox
              id={`checkbox-${task.id}`}
              checked={checked}
              onCheckedChange={(value) => {
                if (value === "indeterminate") return;

                setChecked(value);
                handleUpdateTaskCompletion(value);
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
            <Badge variant="success">{task.experience} XP</Badge>
            {!task.isCompleted && (
              <React.Fragment>
                <hr className="h-5 w-0.5 rounded-full bg-foreground/20" />
                <EditTaskDialog task={task}>
                  <Button variant="outline" size="icon">
                    <PencilIcon />
                  </Button>
                </EditTaskDialog>
              </React.Fragment>
            )}
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
