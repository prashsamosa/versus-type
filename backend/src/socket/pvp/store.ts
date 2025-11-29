import { resetAccuracy } from "@versus-type/shared/accuracy";
import type { LobbyInfo } from "@versus-type/shared/index";
import { generatePassage } from "@versus-type/shared/passage-generator";
import type { PlayerState, RoomState, RoomType } from "./types";

export const MAX_ROOM_SIZE = 10;
export const COUNTDOWN_SECONDS = 3;

export const roomStates: Record<string, RoomState> = {};

const initialRoomState = {
	status: "waiting",
	hostId: null,
	isMatchStarted: false,
	isMatchEnded: false,
	players: {},
	passageConfig: {
		punctuation: false,
		numbers: false,
		wordCount: 50,
	},
} satisfies Partial<RoomState>;

export const initialPlayerState = {
	typingIndex: 0,
	wpm: 0,
	startedAt: 0,
	accuracy: 100,
	accState: resetAccuracy(),
	finished: false,
	timeTyped: 0,
	ordinal: 0,
	isHost: false,
	spectator: false,
	incorrectIdx: null,
} satisfies Partial<PlayerState>;

export async function reinitializeRoomState(roomCode: string) {
	const roomState = roomStates[roomCode];
	roomState.isMatchEnded = false;
	if (!roomState.passage) {
		roomState.passage = await generatePassage(roomState.passageConfig);
	}
	roomState.status = "inProgress";

	const resetedPlayers: { [userId: string]: PlayerState } = {};
	for (const userId in roomState.players) {
		const player = roomState.players[userId];
		if (player.disconnected) continue; // clear disconnectd players
		resetedPlayers[userId] = {
			...initialPlayerState,
			isHost: player.isHost,
			username: player.username,
			spectator: false,
			color: player.color,
			disconnected: player.disconnected,
		};
	}
	roomState.players = resetedPlayers;
}

export async function initializeRoom(roomCode: string, type: RoomType) {
	roomStates[roomCode] = {
		...initialRoomState,
		type,
		passage: await generatePassage(initialRoomState.passageConfig),
	};
}

export function toPlayersInfo(players: { [userId: string]: PlayerState }) {
	const info: LobbyInfo = {};
	for (const userId in players) {
		const p = players[userId];
		info[userId] = {
			isHost: p.isHost,
			username: p.username,
			typingIndex: p.typingIndex,
			wpm: p.wpm,
			accuracy: p.accuracy,
			spectator: p.spectator,
			finished: p.finished,
			ordinal: p.ordinal,
			disconnected: p.disconnected,
			color: p.color,
		};
	}
	return info;
}

export function participantCount(roomCode: string): number {
	const roomState = roomStates[roomCode];
	return Object.keys(roomState.players).reduce(
		(count, userId) =>
			roomState.players[userId].spectator ||
			(roomState.players[userId].disconnected &&
				!roomState.players[userId].finished)
				? count
				: count + 1,
		0,
	);
}

export function typingPlayerCount(roomCode: string): number {
	const roomState = roomStates[roomCode];
	return Object.keys(roomState.players).reduce(
		(count, userId) =>
			roomState.players[userId].spectator ||
			roomState.players[userId].disconnected ||
			roomState.players[userId].finished
				? count
				: count + 1,
		0,
	);
}

export function activePlayersCount(roomCode: string): number {
	const roomState = roomStates[roomCode];
	return Object.keys(roomState.players).reduce(
		(count, userId) =>
			roomState.players[userId].spectator ||
			roomState.players[userId].disconnected
				? count
				: count + 1,
		0,
	);
}
