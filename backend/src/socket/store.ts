import type { LobbyInfo, RoomSettings } from "@versus-type/shared";
import type { AccuracyState } from "@versus-type/shared/accuracy";
import { resetAccuracy } from "@versus-type/shared/accuracy";
import type { ChatMessage } from "@versus-type/shared/index";
import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { generatePassage } from "@versus-type/shared/passage-generator";

export type PlayerState = {
	isHost?: boolean;
	username?: string;
	color: string;
	spectator: boolean;
	disconnected?: boolean;
	rollingAvgWpm?: number;

	// game-specific, needs RESET
	typingIndex: number;
	wpm?: number;
	startedAt?: number;
	accuracy?: number;
	accState?: AccuracyState;
	finished?: boolean;
	timeTyped?: number;
	ordinal?: number;
	incorrectIdx: number | null;
};

export type RoomType = "public" | "private" | "single-match";

export type RoomState = {
	status: "inProgress" | "waiting" | "closed";
	type: RoomType;
	passage: string;
	hostId: string | null;
	isMatchStarted: boolean;
	isMatchEnded: boolean;
	players: { [userId: string]: PlayerState };
	passageConfig: GeneratorConfig;
	chat: ChatMessage[];
	maxPlayers: number;
	avgWpm: number;
	// currentMatchId: string | null;
};

export const COUNTDOWN_SECONDS = 3;

export const roomStates: Record<string, RoomState> = {};

// why is this a function?
// it has objects like players, chat, passageConfig that need to be unique per room
// if we just do initialRoomState = { ... }, and use spread operator later to copy it, its a shallow copy
// ie, all those objects will be shared between rooms. mfw I realized players are leaking between rooms lol
function createInitialRoomState() {
	return {
		status: "waiting",
		hostId: null,
		isMatchStarted: false,
		isMatchEnded: false,
		players: {},
		maxPlayers: 8,
		chat: [],
		passageConfig: initialPassageConfig,
		avgWpm: 0,
	} satisfies Partial<RoomState>;
}

const initialPassageConfig = {
	language: "English 200",
	punctuation: false,
	numbers: false,
	wordCount: 50,
} satisfies RoomState["passageConfig"];

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
			rollingAvgWpm: player.rollingAvgWpm,
			spectator: false,
			color: player.color,
			disconnected: player.disconnected,
		};
	}
	roomState.players = resetedPlayers;
}

export async function initializeRoom(roomCode: string, settings: RoomSettings) {
	const { isPrivate, maxPlayers } = settings;
	const type: RoomType = isPrivate ? "private" : "public";
	roomStates[roomCode] = {
		...createInitialRoomState(),
		players: {},
		chat: [],
		type,
		maxPlayers,
		passage: await generatePassage(initialPassageConfig),
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

export function updateRoomAvgWpm(roomCode: string) {
	const roomState = roomStates[roomCode];
	let totalWpm = 0;
	let count = 0;
	for (const userId in roomState.players) {
		const player = roomState.players[userId];
		if (!player.spectator && !player.disconnected && player.rollingAvgWpm) {
			totalWpm += player.rollingAvgWpm;
			count++;
		}
	}
	roomState.avgWpm = count > 0 ? totalWpm / count : 0;
}
