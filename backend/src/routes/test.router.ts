import { TestStatsSchema } from "@versus-type/types/src/test.zod";
import { fromNodeHeaders } from "better-auth/node";
import { sql } from "drizzle-orm";
import { and, eq } from "drizzle-orm/sqlite-core/expressions";
import { Router } from "express";
import { auth } from "../auth/auth";
import { db } from "../db";
import { tests, userStats } from "../db/schema";

const testRouter = Router();

testRouter.post("/", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const testData = TestStatsSchema.parse(req.body);
	console.log("Received test data:", testData);
	await db.transaction(async (tx) => {
		await tx.insert(tests).values({
			userId: session.user.id,
			...testData,
		});
		await tx
			.update(userStats)
			.set({
				tests: sql`${userStats.tests} + 1`,
				avgWpm: sql`(((${userStats.avgWpm} * ${userStats.tests}) + ${testData.wpm}) / (${userStats.tests} + 1))`,
				avgAccuracy: sql`(((${userStats.avgAccuracy} * ${userStats.tests}) + ${testData.accuracy}) / (${userStats.tests} + 1))`,
				correctChars: sql`${userStats.correctChars} + ${testData.correctChars}`,
				errorChars: sql`${userStats.errorChars} + ${testData.errorChars}`,
				totalTimePlayed: sql`${userStats.totalTimePlayed} + ${testData.time}`,
				highestWpm: sql`CASE WHEN ${testData.wpm} > ${userStats.highestWpm} THEN ${testData.wpm} ELSE ${userStats.highestWpm} END`,
			})
			.where(eq(userStats.userId, session.user.id));
	});
	res.json({ message: "Successfully saved test data" });
});

testRouter.delete("/", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const testIdReceived = req.body.testId;
	if (!testIdReceived) {
		res.status(400).json({ error: "testId is required" });
		return;
	}
	console.log(
		"Received request to delete test data for user:",
		session.user.id,
		"testId:",
		testIdReceived,
	);
	const testToDelete = await db
		.select()
		.from(tests)
		.where(and(eq(tests.id, testIdReceived), eq(tests.userId, session.user.id)))
		.limit(1);
	if (testToDelete.length === 0) {
		res.status(404).json({ error: "Test not found" });
		return;
	}
	const testData = testToDelete[0];

	await db.transaction(async (tx) => {
		await tx
			.delete(tests)
			.where(
				and(eq(tests.id, testIdReceived), eq(tests.userId, session.user.id)),
			);

		await tx
			.update(userStats)
			.set({
				tests: sql`${userStats.tests} - 1`,
				correctChars: sql`${userStats.correctChars} - ${testData.correctChars}`,
				errorChars: sql`${userStats.errorChars} - ${testData.errorChars}`,
				totalTimePlayed: sql`${userStats.totalTimePlayed} - ${testData.time}`,
				avgWpm: sql`CASE WHEN ${userStats.tests} - 1 = 0 THEN 0 ELSE (((${userStats.avgWpm} * ${userStats.tests}) - ${testData.wpm}) / (${userStats.tests} - 1)) END`,
				avgAccuracy: sql`CASE WHEN ${userStats.tests} - 1 = 0 THEN 0 ELSE (((${userStats.avgAccuracy} * ${userStats.tests}) - ${testData.accuracy}) / (${userStats.tests} - 1)) END`,
				highestWpm: sql`CASE WHEN ${testData.wpm} = ${userStats.highestWpm} THEN (SELECT MAX(wpm) FROM tests WHERE user_id = ${session.user.id} AND id != ${testIdReceived}) ELSE ${userStats.highestWpm} END`,
			})
			.where(eq(userStats.userId, session.user.id));
		res.json({ message: "Successfully deleted test data" });
	});
});

export default testRouter;
