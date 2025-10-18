import { Button, Dialog, Form, Input, Select } from "@/components/ui";
import { makeFormOptions } from "@/lib/tanstack-query/make-form-options";
import { stringToNumber } from "@/lib/utils/string-utils";
import { TaskContract } from "@org/domain/api/Contracts";
import { TaskFrequency } from "@org/domain/Enums";
import { useForm } from "@tanstack/react-form";
import * as Schema from "effect/Schema";
import { PlusIcon } from "lucide-react";
import React from "react";
import { useCreateTask } from "../api";

type Props = React.PropsWithChildren;

export const CreateTaskDialog = ({ children }: Props) => {
  const [open, setOpen] = React.useState(false);
  const createTaskMutation = useCreateTask();

  const form = useForm({
    ...makeFormOptions({
      schema: TaskContract.CreateTaskPayload,
      defaultValues: {
        title: "",
        description: "",
        frequency: TaskFrequency.Daily,
        experience: 5,
      },
      validator: "onSubmit",
    }),
    onSubmit: async ({ formApi, value }) => {
      const payload = Schema.decodeSync(TaskContract.CreateTaskPayload)(value);
      await createTaskMutation.mutateAsync(payload, {
        onSettled: () => {
          setOpen(false);
          formApi.reset();
        },
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Create task</Dialog.Title>
        </Dialog.Header>
        <Form onSubmit={form.handleSubmit}>
          <div className="flex flex-col gap-2">
            <form.Field name="title">
              {(field) => (
                <Form.Control className="flex-1">
                  <Input
                    type="text"
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Add a new chore..."
                  />

                  <Form.Error error={form.state.errorMap.onSubmit?.title} />
                </Form.Control>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Form.Control className="flex-1">
                  <Input
                    type="text"
                    id={field.name}
                    value={field.state.value ?? ""}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                    placeholder="Add a new chore description..."
                  />

                  <Form.Error error={form.state.errorMap.onSubmit?.description} />
                </Form.Control>
              )}
            </form.Field>

            <form.Field name="frequency">
              {() => (
                <Form.Control className="flex-1">
                  <Select>
                    <Select.Trigger>
                      <Select.Value placeholder="Select a frequency" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {Object.entries(TaskFrequency).map(([key, value]) => (
                          <Select.Item key={value} value={value}>
                            {key}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>

                  <Form.Error error={form.state.errorMap.onSubmit?.frequency} />
                </Form.Control>
              )}
            </form.Field>

            <form.Field name="experience">
              {(field) => (
                <Form.Control className="flex-1">
                  <Input
                    type="number"
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(stringToNumber(e.target.value));
                    }}
                    placeholder="Add the new chore experience..."
                  />

                  <Form.Error error={form.state.errorMap.onSubmit?.experience} />
                </Form.Control>
              )}
            </form.Field>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting] as const}
              children={([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit} size="icon" className="w-full">
                  {isSubmitting ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <PlusIcon className="h-5 w-5" />
                  )}
                  Add chore
                </Button>
              )}
            />
          </div>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
