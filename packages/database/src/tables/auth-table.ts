import * as pg from "drizzle-orm/pg-core";
import * as DateTime from "effect/DateTime";
import { constant } from "effect/Function";

const utcNow = constant(DateTime.toDateUtc(DateTime.unsafeNow()));

export const user = pg.pgTable("user", {
  id: pg.text("id").primaryKey(),
  name: pg.text("name").notNull(),
  email: pg.text("email").notNull().unique(),
  emailVerified: pg.boolean("email_verified").default(false).notNull(),
  image: pg.text("image"),
  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const session = pg.pgTable("session", {
  id: pg.text("id").primaryKey(),
  expiresAt: pg.timestamp("expires_at").notNull(),
  token: pg.text("token").notNull().unique(),
  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
  ipAddress: pg.text("ip_address"),
  userAgent: pg.text("user_agent"),
  userId: pg
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pg.pgTable("account", {
  id: pg.text("id").primaryKey(),
  accountId: pg.text("account_id").notNull(),
  providerId: pg.text("provider_id").notNull(),
  userId: pg
    .text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: pg.text("access_token"),
  refreshToken: pg.text("refresh_token"),
  idToken: pg.text("id_token"),
  accessTokenExpiresAt: pg.timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: pg.timestamp("refresh_token_expires_at"),
  scope: pg.text("scope"),
  password: pg.text("password"),
  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});

export const verification = pg.pgTable("verification", {
  id: pg.text("id").primaryKey(),
  identifier: pg.text("identifier").notNull(),
  value: pg.text("value").notNull(),
  expiresAt: pg.timestamp("expires_at").notNull(),
  createdAt: pg.timestamp("created_at").defaultNow().notNull(),
  updatedAt: pg
    .timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(utcNow),
});
