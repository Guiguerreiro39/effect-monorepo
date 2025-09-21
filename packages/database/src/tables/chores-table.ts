import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import { constant } from "effect/Function";
import { Frequency } from "../common/enums.js";
import { user } from "./auth-table.js";

const utcNow = constant(DateTime.toDateUtc(DateTime.unsafeNow()));

export const frequencyEnum = pg.pgEnum("frequency", [
  Frequency.Daily,
  Frequency.Weekly,
  Frequency.Monthly,
  Frequency.OneTime,
]);

export const choresTable = pg.pgTable("chores", {
  id: pg.uuid("id").primaryKey().defaultRandom(),
  title: pg.varchar("title", { length: 200 }).notNull(),
  description: pg.varchar("description", { length: 500 }),
  frequency: frequencyEnum("frequency").notNull(),
  createdBy: pg
    .uuid("created_by")
    .references(() => user.id)
    .notNull(),
  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const choreCompletionTable = pg.pgTable("chore_completions", {
  id: pg.serial("id").primaryKey(),
  choreId: pg
    .integer("chore_id")
    .references(() => choresTable.id)
    .notNull(),
  userId: pg
    .uuid("user_id")
    .references(() => user.id)
    .notNull(),
  completedAt: pg.timestamp("completed_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});
