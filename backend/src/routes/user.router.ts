import type { UserStats } from "@versus-type/shared";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { rollingAvgWpmFromDB } from "@/socket/dbservice";
import { db } from "../db";
import { userStats } from "../db/schema";

const userRouter = Router();

userRouter.get("/", async (_, res) => {
	res.json(res.locals.session);
});

userRouter.get("/stats", async (_, res) => {
	const session = res.locals.session;
	if (!session) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	const [statsResult, rollingAvgResult] = await Promise.allSettled([
		await db
			.select()
			.from(userStats)
			.where(eq(userStats.userId, session.user.id)),
		await rollingAvgWpmFromDB(session.user.id),
	]);

	if (statsResult.status === "rejected") {
		res.status(500).json({ error: "Database error" });
		return;
	}

	const stats = statsResult.value;
	if (stats.length === 0) {
		res.status(404).json({ error: "stats not found" });
		return;
	}

	const { userId: __, updatedAt: ___, ...returnObj } = stats[0];

	res.json({
		...returnObj,
		rollingAvgWpm:
			rollingAvgResult.status === "fulfilled"
				? (rollingAvgResult.value ?? 0)
				: 0,
	} as UserStats);
});

export default userRouter;

// userRouter.patch("/settings", async (req, res) => {
// 	const session = res.locals.session;
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
// 	const session = res.locals.session;
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
