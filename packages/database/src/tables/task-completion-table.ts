import { relations } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { utcNow } from "../lib/utils.js";
import { user } from "./auth-table.js";
import { task } from "./task-table.js";

enum TaskCompletionStatus {
  Pending = "pending",
  Failed = "failed",
  Completed = "completed",
}

export const taskCompletionStatusEnum = pg.pgEnum("task_completion_status", [
  TaskCompletionStatus.Pending,
  TaskCompletionStatus.Failed,
  TaskCompletionStatus.Completed,
]);

export const taskCompletion = pg.pgTable("task_completion", {
  id: pg.uuid("id").primaryKey().defaultRandom(),
  taskId: pg.uuid("task_id").notNull(),
  status: taskCompletionStatusEnum("status").notNull().default(TaskCompletionStatus.Pending),
  experience: pg.smallint("experience").notNull(),
  completedBy: pg.text("user_id"),

  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const taskCompletionRelations = relations(taskCompletion, ({ one }) => ({
  task: one(task, {
    fields: [taskCompletion.taskId],
    references: [task.id],
  }),
  user: one(user, {
    fields: [taskCompletion.completedBy],
    references: [user.id],
  }),
}));
