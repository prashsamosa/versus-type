import { roomSettingsSchema } from "@versus-type/shared";
import { Router } from "express";
import { customAlphabet } from "nanoid";
import { initializeRoom, roomStates } from "@/socket/store";

const MATCH_CODE_LENGTH = 6;
const alphabet =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nanoid = customAlphabet(alphabet, MATCH_CODE_LENGTH);

export const pvpRouter = Router();

pvpRouter.post("/host", async (req, res) => {
	const parseResult = roomSettingsSchema.safeParse(req.body);
	if (!parseResult.success) {
		return res.status(400).json({ success: false, error: "Invalid settings" });
	}
	const settings = parseResult.data;

	let roomCode = "";
	while (roomStates[roomCode] || roomCode === "") roomCode = nanoid();
	await initializeRoom(roomCode, settings);

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
