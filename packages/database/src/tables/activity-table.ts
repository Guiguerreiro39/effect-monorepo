import { relations } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { utcNow } from "../lib/utils.js";
import { user } from "./auth-table.js";
import { task } from "./task-table.js";

enum ActivityType {
  Task = "task",
  LevelUp = "levelUp",
  Reward = "reward",
}

export const activityType = pg.pgEnum("activity_type", [
  ActivityType.Task,
  ActivityType.LevelUp,
  ActivityType.Reward,
]);

enum TaskActivityStatus {
  Failed = "failed",
  Completed = "completed",
}

export const taskActivityStatus = pg.pgEnum("task_activity_status", [
  TaskActivityStatus.Failed,
  TaskActivityStatus.Completed,
]);

export const activity = pg.pgTable("activity", {
  id: pg.uuid("id").primaryKey().defaultRandom(),

  // Task
  taskId: pg.uuid("task_id"),
  status: taskActivityStatus("status"),
  experience: pg.smallint("experience"),
  title: pg.varchar("title", { length: 200 }),
  completedBy: pg.text("user_id"),
  hashIdentifier: pg.varchar("hash_identifier"),

  // LevelUp
  level: pg.smallint("level"),

  // Shared
  type: activityType("type").notNull(),

  createdAt: pg.timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const activityRelations = relations(activity, ({ one }) => ({
  task: one(task, {
    fields: [activity.taskId],
    references: [task.id],
  }),
  user: one(user, {
    fields: [activity.completedBy],
    references: [user.id],
  }),
}));
