import {
	type RoomInfo,
	type RoomSettingsClient,
	roomSettingsClientSchema,
} from "@versus-type/shared";
import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";
import { customAlphabet } from "nanoid";
import { io } from "@/app";
import { auth } from "@/auth/auth";
import { rollingAvgWpmFromDB } from "@/socket/dbservice";
import { findBestMatch } from "@/socket/matchmaking";
import {
	activePlayersCount,
	initializeRoom,
	type RoomSettings,
	roomStates,
} from "@/socket/store";

const DEFAULT_WPM = 60;
const MATCH_CODE_LENGTH = 6;
const MAX_MATCHMAKING_PLAYERS = 6;

const alphabet =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const nanoid = customAlphabet(alphabet, MATCH_CODE_LENGTH);

export const pvpRouter = Router();

function toRoomSettings(settings: RoomSettingsClient): RoomSettings {
	return {
		type: settings.isPrivate ? "private" : "public",
		maxPlayers: settings.maxPlayers,
	};
}

pvpRouter.post("/host", async (req, res) => {
	const parseResult = roomSettingsClientSchema.safeParse(req.body);
	if (!parseResult.success) {
		return res.status(400).json({ success: false, error: "Invalid settings" });
	}
	const settings = parseResult.data;

	let roomCode = "";
	while (roomStates[roomCode] || roomCode === "") roomCode = nanoid();
	await initializeRoom(roomCode, toRoomSettings(settings));

	console.log(`Room ${roomCode} created`);

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
					players: activePlayersCount(roomCode),
					maxPlayers: roomState.maxPlayers,
					status: roomState.status === "inProgress" ? "inProgress" : "waiting",
					passageConfig: roomState.passageConfig,
					avgWpm: roomState.avgWpm,
				}) satisfies RoomInfo,
		);

	res.json(publicRooms);
});

pvpRouter.get("/matchmake", async (req, res) => {
	const session = await auth.api.getSession({
		headers: fromNodeHeaders(req.headers),
	});
	let avgWpm = DEFAULT_WPM;
	if (session) {
		avgWpm = (await rollingAvgWpmFromDB(session.user.id)) || DEFAULT_WPM;
	}
	const totalOnlinePlayers = io.engine.clientsCount;
	const roomCode = findBestMatch(roomStates, avgWpm, totalOnlinePlayers);
	if (roomCode) {
		res.json({ roomCode });
	} else {
		let newRoomCode = "";
		while (roomStates[newRoomCode] || newRoomCode === "")
			newRoomCode = nanoid();

		const settings: RoomSettings = {
			type: "single-match",
			maxPlayers: MAX_MATCHMAKING_PLAYERS,
		};
		await initializeRoom(newRoomCode, settings);

		res.json({ roomCode: newRoomCode });
	}
});
