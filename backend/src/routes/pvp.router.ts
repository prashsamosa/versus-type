import { Router } from "express";
import { customAlphabet } from "nanoid";
import { initializeRoom, roomStates } from "@/socket/pvp/store";

const MATCH_CODE_LENGTH = 6;
const alphabet =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nanoid = customAlphabet(alphabet, MATCH_CODE_LENGTH);

export const pvpRouter = Router();
pvpRouter.post("/host", async (req, res) => {
	const isPrivate = req.body.private;
	if (typeof isPrivate !== "boolean") {
		res.status(400).json({ error: "Invalid private value" });
		return;
	}

	let roomCode = "";
	while (roomStates[roomCode]) roomCode = nanoid();
	await initializeRoom(roomCode, isPrivate ? "private" : "public");

	res.json({ success: true, roomCode: roomCode });
});

pvpRouter.post("/room-status", async (req, res) => {
	const roomCode = req.body.roomCode;
	let status = "notFound";
	if (roomStates[roomCode]) {
		status = roomStates[roomCode].status;
	}
	if (status === "closed") status = "notFound";
	res.json({ status });
});
