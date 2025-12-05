import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { matches, matchParticipants, userStats } from "@/db/schema";
import type { RoomState } from "./store.ts";

const ROLLING_AVG_MATCH_COUNT = 10;

export async function updatePlayersInfoInDB(roomState: RoomState) {
	const matchId = await db
		.insert(matches)
		.values({
			passage: roomState.passage,
		})
		.returning({ id: matches.id })
		.then((r) => r[0]?.id);
	if (!matchId) {
		console.error(
			"updatePlayersInfoInDB: couldn't create match record(matchId is null), aborting",
		);
		return;
	}
	for (const userId in roomState.players) {
		if (
			roomState.players[userId].spectator ||
			!roomState.players[userId].finished
		)
			continue;
		const player = roomState.players[userId];
		if (!player.finished) continue;
		const isWinner = player.ordinal === 1 ? 1 : 0;
		const accuracy = player.accuracy ?? 0;

		await Promise.allSettled([
			db
				.insert(matchParticipants)
				.values({
					matchId: matchId,
					userId: userId,
					ordinal: player.ordinal,
					accuracy: accuracy,
					wpm: player.wpm || 0,
				})
				.catch((err) => {
					console.error("Error inserting match participant:", err);
				}),

			db
				.update(userStats)
				.set({
					pvpMatches: sql`${userStats.pvpMatches} + 1`,
					wins: sql`${userStats.wins} + ${isWinner ? 1 : 0}`,
					avgWpm: sql`(((${userStats.avgWpm} * ${userStats.pvpMatches}) + ${player.wpm || 0}) / (${userStats.pvpMatches} + 1))`,
					avgAccuracy: sql`(((${userStats.avgAccuracy} * ${userStats.pvpMatches}) + ${accuracy}) / (${userStats.pvpMatches} + 1))`,
					highestWpm: sql`CASE WHEN ${player.wpm || 0} > ${userStats.highestWpm} THEN ${player.wpm || 0} ELSE ${userStats.highestWpm} END`,
					totalTimeTyped: sql`${userStats.totalTimeTyped} + ${player.timeTyped ?? 0}`,
				})
				.where(eq(userStats.userId, userId))
				.catch((err) => {
					console.error("Error updating user stats in DB:", err);
				}),
		]);
	}
}

export async function rollingAvgWpmFromDB(userId: string) {
	if (!userId) return 60;
	const result = await db
		.select({ rollingAvgWpm: sql<number>`AVG(wpm)` })
		.from(
			db
				.select({ wpm: matchParticipants.wpm })
				.from(matchParticipants)
				.where(eq(matchParticipants.userId, userId))
				.orderBy(desc(matchParticipants.id))
				.limit(ROLLING_AVG_MATCH_COUNT)
				.as("last_matches"),
		);

	const rollingAvgWpm = result[0]?.rollingAvgWpm;
	if (rollingAvgWpm === null || rollingAvgWpm === undefined) {
		return undefined;
	}
	return rollingAvgWpm;
}

export async function newRollingAvgWpmFromDB(userId: string, newWpm: number) {
	const nminusone = await db
		.select({ wpm: matchParticipants.wpm })
		.from(matchParticipants)
		.where(eq(matchParticipants.userId, userId))
		.orderBy(desc(matchParticipants.id))
		.limit(ROLLING_AVG_MATCH_COUNT - 1);

	const wpms = nminusone.map((r) => r.wpm ?? 0);
	wpms.push(newWpm);

	return wpms.reduce((sum, w) => sum + w, 0) / wpms.length;
}
