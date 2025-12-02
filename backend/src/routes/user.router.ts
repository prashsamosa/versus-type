import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { auth } from "../auth/auth";
import { db } from "../db";
import { userStats } from "../db/schema";

const userRouter = Router();

userRouter.get("/", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	res.json(session);
});

userRouter.get("/stats", async (req, res) => {
	console.log("Fetching user stats");
	await new Promise((resolve) => setTimeout(resolve, 1000));
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	if (!session) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const stats = await db
		.select()
		.from(userStats)
		.where(eq(userStats.userId, session.user.id));
	if (stats.length === 0) {
		res.status(404).json({ error: "stats not found" });
		return;
	}
	const { userId: _, ...returnObj } = stats[0];
	res.json(returnObj);
});

export default userRouter;

// userRouter.patch("/settings", async (req, res) => {
// 	await new Promise((resolve) => setTimeout(resolve, 1000));
// 	const session = await auth.api.getSession({
// 		headers: fromNodeHeaders(req.headers),
// 	});
// 	if (!session) {
// 		res.status(401).json({ error: "Unauthorized" });
// 		return;
// 	}
// 	const updatedSettings = SettingsSchema.parse(req.body);
// 	const existingSettings = await db
// 		.select()
// 		.from(userSettings)
// 		.where(eq(userSettings.userId, session.user.id));
//
// 	if (existingSettings.length > 0) {
// 		await db
// 			.update(userSettings)
// 			.set(updatedSettings)
// 			.where(eq(userSettings.userId, session.user.id));
// 	} else {
// 		await db
// 			.insert(userSettings)
// 			.values({ userId: session.user.id, ...updatedSettings });
// 	}
//
// 	res.json({ message: "Settings updated successfully" });
// });
//
// userRouter.get("/settings", async (req, res) => {
// 	console.log("YOOOOO");
// 	await new Promise((resolve) => setTimeout(resolve, 1000));
// 	const session = await auth.api.getSession({
// 		headers: fromNodeHeaders(req.headers),
// 	});
// 	if (!session) {
// 		res.status(401).json({ error: "Unauthorized" });
// 		return;
// 	}
// 	let settings = await db
// 		.select()
// 		.from(userSettings)
// 		.where(eq(userSettings.userId, session.user.id));
// 	if (settings.length === 0) {
// 		settings = await db
// 			.insert(userSettings)
// 			.values({
// 				userId: session.user.id,
// 			})
// 			.returning();
// 	}
// 	const { userId, ...returnObj } = settings[0];
// 	res.json(returnObj);
// });
