import { sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

// auth-schema by better-auth

export const user = sqliteTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("idx_name").on(table.name)],
);

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// auth-schema END

export const userSettings = sqliteTable("userSettings", {
  userId: text()
    .notNull()
    .references(() => user.id),
  soundEnabled: integer({ mode: "boolean" }).notNull().default(true),
  typingSoundEnabled: integer({ mode: "boolean" }).notNull().default(true),
});

export const userStats = sqliteTable(
  "userStats",
  {
    userId: text()
      .notNull()
      .references(() => user.id),
    soloMatches: integer().notNull().default(0),
    pvpMatches: integer().notNull().default(0),
    wins: integer().notNull().default(0),
    avgWpmPvp: integer().notNull().default(0),
    avgAccuracyPvp: integer().notNull().default(0),
    highestWpm: integer().notNull().default(0),
    totalTimePlayed: integer().notNull().default(0),
    wordsTyped: integer().notNull().default(0),
    updatedAt: text(),
  },
  (table) => [
    index("idx_avgWpmPvp").on(table.avgWpmPvp),
    index("idx_avgAccuracyPvp").on(table.avgAccuracyPvp),
  ],
);

export const matches = sqliteTable(
  "matches",
  {
    id: text()
      .primaryKey()
      .notNull()
      .$defaultFn(() => randomUUID()),
    mode: text().notNull().$type<"solo" | "pvp">(),
    private: integer({ mode: "boolean" }).notNull().default(false),
    status: text().notNull().default("completed"),
    matchCode: text().unique(),
    createdAt: text().notNull(),
    participantsDetails: text({ mode: "json" }).notNull().$type<{
      userId: string;
      wpm: number;
      accuracy: number;
      isWinner: boolean;
      disconnected: boolean;
    }>(),
  },
  (table) => [
    // index("idx_matchType").on(table.matchType),
    check("chk_matchType", sql`${table.mode} IN ('solo', 'pvp')`),
    check(
      "chk_status",
      sql`${table.status} IN ('inProgress', 'completed', 'cancelled')`,
    ),
  ],
);
