import { activePlayersCount } from "./store";
import type { RoomState } from "./types";

type TBDRoomState = RoomState & {
	isPrivate: boolean;
	countdown: number;
	maxPlayers: number;
	type: "public" | "private" | "matchmaking";
	avgWpm: number;
	lastMatchEndedAt: number;
};

export function findBestMatch(
	rooms: Record<string, TBDRoomState>,
	playerStats: any,
	totalOnlinePlayers: number,
): string | null {
	// TUNABLES
	const MATCHMAKING_ROOM_BASE = 100;
	const HOSTED_ROOM_BASE = 70;

	let ONE_PLAYER_BONUS: number;
	let FULLNESS_MULTIPLIER: number;

	const WAITING_BONUS = 40;

	let WPM_GAP_PENALTY: number; // multiplier for each WPM point difference
	const MIN_WPM_GAP = 20;
	let LARGE_WPM_GAP_PENALTY: number;
	const LARGE_WPM_GAP = 50;

	// right now, inactivity is calculated by time since last match ended
	const INACTIVE_ROOM_PENALTY = 60;
	const INACTIVITY_STEP_MS = 5 * 60 * 1000; // apply penalty every 5 minutes of inactivity

	let MIN_SCORE_THRESHOLD: number;

	if (totalOnlinePlayers < 15) {
		// low traffic, any match is a good match, dont stack
		ONE_PLAYER_BONUS = 60;
		FULLNESS_MULTIPLIER = 20;
		WPM_GAP_PENALTY = 1;
		LARGE_WPM_GAP_PENALTY = 60;
		MIN_SCORE_THRESHOLD = 10;
	} else if (totalOnlinePlayers < 100) {
		// medium traffic, balance between speed and quality matches
		ONE_PLAYER_BONUS = 30;
		FULLNESS_MULTIPLIER = 40;
		WPM_GAP_PENALTY = 1;
		LARGE_WPM_GAP_PENALTY = 70;
		MIN_SCORE_THRESHOLD = 30;
	} else {
		// high traffic, prioritize quality matches, more stacking
		ONE_PLAYER_BONUS = 10;
		FULLNESS_MULTIPLIER = 60;
		WPM_GAP_PENALTY = 1.2;
		LARGE_WPM_GAP_PENALTY = 80;
		MIN_SCORE_THRESHOLD = 40;
	}

	let bestRoomCode: string | null = null;
	let maxScore = -Infinity;
	for (const roomCode in rooms) {
		const room = rooms[roomCode];
		const activeCount = activePlayersCount(roomCode);
		// filter
		if (
			room.type === "private" ||
			room.status === "closed" ||
			activeCount >= room.maxPlayers
		) {
			continue;
		}

		// base score on type
		let score =
			room.type === "matchmaking" ? MATCHMAKING_ROOM_BASE : HOSTED_ROOM_BASE;

		// waiting rooms
		if (room.status === "waiting") score += WAITING_BONUS;

		// fullness
		const fullness = activeCount / room.maxPlayers;
		if (activeCount === 1) score += ONE_PLAYER_BONUS;
		else score += fullness * FULLNESS_MULTIPLIER;

		// skill matching
		const wpmDiff = Math.abs(room.avgWpm - playerStats.avgWpm);
		score -= Math.max(0, wpmDiff - MIN_WPM_GAP) * WPM_GAP_PENALTY;
		if (wpmDiff >= LARGE_WPM_GAP) score -= LARGE_WPM_GAP_PENALTY;

		// inactive hosted rooms
		const inactivePeriod =
			room.type === "matchmaking" ? 0 : Date.now() - room.lastMatchEndedAt;
		score -=
			INACTIVE_ROOM_PENALTY * Math.floor(inactivePeriod / INACTIVITY_STEP_MS);
		if (score > maxScore) {
			maxScore = score;
			bestRoomCode = roomCode;
		}
	}
	if (maxScore < MIN_SCORE_THRESHOLD) return null;
	return bestRoomCode;
}
