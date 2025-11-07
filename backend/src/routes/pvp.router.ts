import { eq } from "drizzle-orm";
import { Router } from "express";
import { customAlphabet } from "nanoid";
import { db } from "../db";
import { rooms } from "../db/schema";

const MATCH_CODE_LENGTH = 6;
const alphabet =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nanoid = customAlphabet(alphabet, MATCH_CODE_LENGTH);

type RoomInfo = {
	id: string;
	status: "waiting" | "inProgress" | "notFound";
};

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
	let roomCode = "";
	while (!inserted) {
		// keep retrying until roomCode is unique
		roomCode = nanoid();
		const res = await db
			.insert(rooms)
			.values({
				private: isPrivate,
				roomCode: roomCode,
			})
			.onConflictDoNothing()
			.returning();
		if (res.length > 0) inserted = true;
	}

	res.json({ success: true, roomCode: roomCode });
});

pvpRouter.post("/room-status", async (req, res) => {
	const roomCode = req.body.roomCode;
	const status = await roomInfo(roomCode);
	res.json({ status });
});

export async function roomInfo(roomCode: string): Promise<RoomInfo> {
	let roomStatus: "waiting" | "inProgress" | "notFound";
	if (typeof roomCode !== "string" || roomCode.length !== MATCH_CODE_LENGTH) {
		roomStatus = "notFound";
		return { status: roomStatus, id: "" };
	}
	const room = await db
		.select()
		.from(rooms)
		.where(eq(rooms.roomCode, roomCode))
		.limit(1)
		.then((r) => r[0]);
	if (!room) {
		roomStatus = "notFound";
		return { status: roomStatus, id: "" };
	}

	roomStatus = room.status === "completed" ? "inProgress" : room.status;

	return {
		id: room.id,
		status: roomStatus,
	};
}
