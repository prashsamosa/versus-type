import { Router } from "express";
import { customAlphabet } from "nanoid";
import { db } from "../db";
import { matches } from "../db/schema";

const MATCH_CODE_LENGTH = 6;
const alphabet =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nanoid = customAlphabet(alphabet, MATCH_CODE_LENGTH);

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
