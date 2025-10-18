import { relations } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { utcNow, utcToday } from "../lib/utils.js";
import { activity } from "./activity-table.js";
import { user } from "./auth-table.js";

enum TaskFrequency {
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  OneTime = "one-time",
}

export const frequencyEnum = pg.pgEnum("frequency", [
  TaskFrequency.Daily,
  TaskFrequency.Weekly,
  TaskFrequency.Monthly,
  TaskFrequency.OneTime,
]);

export const task = pg.pgTable("task", {
  id: pg.uuid("id").primaryKey().defaultRandom(),
  createdBy: pg.text("created_by").notNull(),

  title: pg.varchar("title", { length: 200 }).notNull(),
  description: pg.varchar("description", { length: 500 }),
  frequency: frequencyEnum("frequency").notNull(),
  experience: pg.smallint("experience").notNull(),

  isCompleted: pg.boolean("is_completed").notNull().default(false),
  hashIdentifier: pg.varchar("hash_identifier").notNull(),

  nextExecutionDate: pg.timestamp("next_execution_date").notNull().$default(utcToday),
  prevExecutionDate: pg.timestamp("prev_execution_date"),

  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const taskRelations = relations(task, ({ many, one }) => ({
  creator: one(user, {
    fields: [task.createdBy],
    references: [user.id],
  }),
  activities: many(activity),
}));
