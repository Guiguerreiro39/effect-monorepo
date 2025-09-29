import { Badge, Button, Card, Checkbox } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { Task } from "@org/domain/api/TaskContract";
import { FlameIcon, PencilIcon } from "lucide-react";
import React from "react";
import { EditTaskDialog } from "./edit-task-dialog";

export const TaskItem = ({ task }: { task: Task }) => {
  const [checked, setChecked] = React.useState(false);

  return (
    <Card>
      <label
        htmlFor={`checkbox-${task.id}`}
        onClick={() => {
          setChecked((prev) => !prev);
        }}
        className="w-full"
      >
        <Card.Content className="grid grid-cols-2 gap-4 px-4 py-2">
          <div className="flex items-center gap-4">
            <Checkbox
              id={`checkbox-${task.id}`}
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
              <FlameIcon className="size-4" />4
            </Badge>
            <Badge variant="success">10 XP</Badge>
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
