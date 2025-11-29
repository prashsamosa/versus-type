import { type RoomInfo, roomSettingsSchema } from "@versus-type/shared";
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
	console.log(`Room ${roomCode} created`);
	console.log(
		Object.entries(roomStates[roomCode].players).map(([, p]) => p.username),
	);

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

pvpRouter.get("/rooms", (_, res) => {
	const publicRooms = Object.entries(roomStates)
		.filter(
			([, roomState]) =>
				roomState.type === "public" && roomState.status !== "closed",
		)
		.map(
			([roomCode, roomState]) =>
				({
					roomCode,
					players: Object.values(roomState.players).filter(
						(player) => !player.spectator && !player.disconnected,
					).length,
					maxPlayers: roomState.maxPlayers,
					status: roomState.status === "inProgress" ? "inProgress" : "waiting",
					passageConfig: roomState.passageConfig,
				}) satisfies RoomInfo,
		);

	res.json(publicRooms);
});
