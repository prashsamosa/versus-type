import { eq } from "drizzle-orm";
import { Router } from "express";
import { customAlphabet } from "nanoid";
import { db } from "../db";
import { matches } from "../db/schema";

const MATCH_CODE_LENGTH = 6;
const alphabet =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nanoid = customAlphabet(alphabet, MATCH_CODE_LENGTH);

type MatchStatus = "notFound" | "inProgress" | "expired" | "waiting";

export const pvpRouter = Router();
pvpRouter.post("/host", async (req, res) => {
	// const session = await auth.api.getSession({
	//     headers: fromNodeHeaders(req.headers),
	// });
	// if (!session) {
	//     res.status(401).json({ error: "Unauthorized" });
	//     return;
	// }

	const isPrivate = req.body.private;
	if (typeof isPrivate !== "boolean") {
		res.status(400).json({ error: "Invalid private value" });
		return;
	}

	let inserted = false;
	let matchCode = "";
	while (!inserted) {
		// keep retrying until matchCode is unique
		matchCode = nanoid();
		const res = await db
			.insert(matches)
			.values({ private: isPrivate, matchCode })
			.onConflictDoNothing()
			.returning();
		if (res.length > 0) inserted = true;
	}

	res.json({ success: true, matchCode });
});

pvpRouter.post("/match-status", async (req, res) => {
	let matchStatus: MatchStatus;
	const matchCode = req.body.matchCode;
	if (typeof matchCode !== "string" || matchCode.length !== MATCH_CODE_LENGTH) {
		matchStatus = "notFound";
		res.json({ matchStatus });
		return;
	}
	const match = await db
		.select()
		.from(matches)
		.where(eq(matches.matchCode, matchCode))
		.limit(1)
		.then((r) => r[0]);
	if (!match) {
		matchStatus = "notFound";
	} else if (match.status === "waiting") {
		matchStatus = "waiting";
	} else if (match.status === "inProgress") {
		matchStatus = "inProgress";
	} else {
		matchStatus = "expired";
	}
	res.json({ matchStatus });
});
