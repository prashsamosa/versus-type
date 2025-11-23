import { activePlayersCount } from "./store";
import type { RoomState } from "./types";

type TBDRoomState = RoomState & {
	isPrivate: boolean;
	countdown: number;
	maxPlayers: number;
	type: "public" | "private" | "matchmaking";
	avgWpm: number;
	lastMatchEndedAt: number | null;
};

export function findBestMatch(
	rooms: Record<string, TBDRoomState>,
	playerStats: any,
	totalOnlinePlayers: number,
): string | null {
	// TUNABLES
	const MATCHMAKING_ROOM_BASE = 100;
	const HOSTED_ROOM_BASE = 40;

	let ONE_PLAYER_BONUS = 60;
	let IDEAL_FULLNESS_BONUS = 15;

	const WAITING_BONUS = 40;

	let WPM_GAP_PENALTY = 0.8;
	const MIN_WPM_GAP = 20;
	const LARGE_WPM_GAP_PENALTY = 40;
	const LARGE_WPM_GAP = 60;

	const INACTIVE_ROOM_PENALTY = 50;
	const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes

	let MIN_SCORE_THRESHOLD = -20;

	if (totalOnlinePlayers < 20) {
		// low traffic, any match is a good match
		ONE_PLAYER_BONUS = 60;
		IDEAL_FULLNESS_BONUS = 15;
		WPM_GAP_PENALTY = 0.8;
		MIN_SCORE_THRESHOLD = -20;
	} else if (totalOnlinePlayers < 100) {
		// medium traffic, balance between speed and quality matches
		ONE_PLAYER_BONUS = 40;
		IDEAL_FULLNESS_BONUS = 30;
		WPM_GAP_PENALTY = 1;
		MIN_SCORE_THRESHOLD = 0;
	} else {
		// high traffic, prioritize quality matches
		ONE_PLAYER_BONUS = 20;
		IDEAL_FULLNESS_BONUS = 40;
		WPM_GAP_PENALTY = 1.2;
		MIN_SCORE_THRESHOLD = 30;
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
			activeCount >= room.maxPlayers ||
			room.countdown <= 2
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
		else if (fullness <= 0.8 && fullness >= 0.3) score += IDEAL_FULLNESS_BONUS;

		// skill matching
		const wpmDiff = Math.abs(room.avgWpm - playerStats.avgWpm);
		score -= Math.max(0, wpmDiff - MIN_WPM_GAP) * WPM_GAP_PENALTY;
		if (wpmDiff >= LARGE_WPM_GAP) score -= LARGE_WPM_GAP_PENALTY;

		// inactive hosted rooms
		if (
			room.type === "public" &&
			room.lastMatchEndedAt &&
			Date.now() - room.lastMatchEndedAt > INACTIVITY_THRESHOLD
		) {
			score -= INACTIVE_ROOM_PENALTY;
		}
		if (score > maxScore) {
			maxScore = score;
			bestRoomCode = roomCode;
		}
	}
	if (maxScore < MIN_SCORE_THRESHOLD) return null;
	return bestRoomCode;
}
