import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import {
	check,
	index,
	integer,
	real,
	sqliteTable,
	text,
} from "drizzle-orm/sqlite-core";

// auth-schema by better-auth

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.default(false)
		.notNull(),
	image: text("image"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	isAnonymous: integer("is_anonymous", { mode: "boolean" }),
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
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
		mode: "timestamp_ms",
	}),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp_ms",
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp_ms" })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

// auth-schema END

export const userSettings = sqliteTable("userSettings", {
	userId: text()
		.notNull()
		.primaryKey()
		.references(() => user.id),
	soundEnabled: integer({ mode: "boolean" }).notNull().default(true),
	typingSoundEnabled: integer({ mode: "boolean" }).notNull().default(false),
});

export const userStats = sqliteTable(
	"userStats",
	{
		userId: text()
			.notNull()
			.primaryKey()
			.references(() => user.id),
		tests: integer().notNull().default(0),
		pvpMatches: integer().notNull().default(0),
		wins: integer().notNull().default(0),
		avgWpmPvp: real().notNull().default(0),
		avgAccuracyPvp: real().notNull().default(0),
		highestWpm: real().notNull().default(0),
		avgWpm: real().notNull().default(0),
		avgAccuracy: real().notNull().default(0),
		totalTimeTyped: integer().notNull().default(0),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.notNull()
			.$onUpdateFn(() => new Date()),
	},
	(table) => [
		index("idx_avgWpmPvp").on(table.avgWpmPvp),
		index("idx_avgAccuracyPvp").on(table.avgAccuracyPvp),
	],
);

export const matches = sqliteTable("matches", {
	id: text()
		.primaryKey()
		.$defaultFn(() => randomUUID()),

	passage: text().notNull(),

	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.$defaultFn(() => new Date()),
});

export const matchParticipants = sqliteTable("matchParticipants", {
	id: text()
		.primaryKey()
		.$defaultFn(() => randomUUID()),
	matchId: text()
		.notNull()
		.references(() => matches.id, { onDelete: "cascade" }),
	userId: text()
		.notNull()
		.references(() => user.id),
	wpm: real(),
	accuracy: real(),
	ordinal: integer(),
});

export const tests = sqliteTable(
	"tests",
	{
		id: text()
			.primaryKey()
			.notNull()
			.$defaultFn(() => randomUUID()),
		userId: text()
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		wpm: real().notNull(),
		rawWpm: real().notNull(),
		accuracy: real().notNull(),
		time: integer().notNull(),
		wordsTyped: integer().notNull(),
		correctChars: integer().notNull(),
		errorChars: integer().notNull(),
		mode: text().$type<"time" | "words">().notNull(),
		createdAt: integer("created_at", { mode: "timestamp" })
			.notNull()
			.$defaultFn(() => new Date()),
	},
	(table) => [check("chk_mode", sql`${table.mode} IN ('time', 'words')`)],
);

export type RoomStatus = "inProgress" | "closed" | "waiting";
