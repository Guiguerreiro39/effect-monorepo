import { relations } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";
import { utcNow } from "../lib/utils.js";
import { user } from "./auth-table.js";

export const userMetadata = pg.pgTable("user-metadata", {
  id: pg.uuid("id").primaryKey().defaultRandom(),
  userId: pg.text("user_id").notNull(),

  experience: pg.integer("experience").notNull().default(0),
  currentLevelExperience: pg.integer("current_level_experience").notNull().default(100),
  level: pg.smallint("level").notNull().default(1),

  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const userMetadataRelations = relations(userMetadata, ({ one }) => ({
  user: one(user, {
    fields: [userMetadata.userId],
    references: [user.id],
  }),
}));
