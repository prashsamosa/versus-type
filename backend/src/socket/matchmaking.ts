import { activePlayersCount } from "./store";
import type { RoomState } from "./types";

type TBDRoomState = RoomState & {
	maxPlayers: number;
	type: "public" | "private" | "single_match";
	avgWpm: number;
	lastMatchEndedAt: number;
};

export function findBestMatch(
	rooms: Record<string, TBDRoomState>,
	playerStats: any,
	totalOnlinePlayers: number,
): string | null {
	// TUNABLES
	const BASE_SCORE = 100;

	let ONE_PLAYER_BONUS: number;
	const SWEET_SPOT_PLAYER_COUNT = 4;
	let MAX_SWEET_SPOT_BONUS: number;

	const WAITING_BONUS = 40;

	let WPM_GAP_PENALTY: number; // multiplier for each WPM point difference
	const MIN_WPM_GAP = 20;
	const WPM_DIFF_POWER = 1.1;

	let MIN_SCORE_THRESHOLD: number;

	if (totalOnlinePlayers < 15) {
		// low traffic, any match is a good match, dont stack
		ONE_PLAYER_BONUS = 60;
		MAX_SWEET_SPOT_BONUS = 20;
		WPM_GAP_PENALTY = 1.8;
		MIN_SCORE_THRESHOLD = 10;
	} else if (totalOnlinePlayers < 100) {
		// medium traffic, balance between speed and quality matches
		ONE_PLAYER_BONUS = 30;
		MAX_SWEET_SPOT_BONUS = 40;
		WPM_GAP_PENALTY = 2;
		MIN_SCORE_THRESHOLD = 30;
	} else {
		// high traffic, prioritize quality matches, more stacking
		ONE_PLAYER_BONUS = 10;
		MAX_SWEET_SPOT_BONUS = 50;
		WPM_GAP_PENALTY = 2.2;
		MIN_SCORE_THRESHOLD = 40;
	}

	let bestRoomCode: string | null = null;
	let maxScore = -Infinity;
	for (const roomCode in rooms) {
		const room = rooms[roomCode];
		const activeCount = activePlayersCount(roomCode);
		// filter
		if (room.type !== "single_match" || activeCount >= room.maxPlayers) {
			continue;
		}

		// base score on type
		let score = BASE_SCORE;

		// waiting rooms
		if (room.status === "waiting") score += WAITING_BONUS;

		// fullness
		const sweetSpotDiff = Math.abs(activeCount - SWEET_SPOT_PLAYER_COUNT);
		if (activeCount === 1) score += ONE_PLAYER_BONUS;
		score += Math.max(0, MAX_SWEET_SPOT_BONUS - sweetSpotDiff * 10);

		// skill matching
		const wpmDiff = Math.abs(room.avgWpm - playerStats.avgWpm);
		score -=
			Math.max(0, (wpmDiff - MIN_WPM_GAP) ** WPM_DIFF_POWER) * WPM_GAP_PENALTY;

		if (score > maxScore) {
			maxScore = score;
			bestRoomCode = roomCode;
		}
	}
	if (maxScore < MIN_SCORE_THRESHOLD) return null;
	return bestRoomCode;
}
