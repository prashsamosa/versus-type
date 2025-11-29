import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { matches, matchParticipants, userStats } from "@/db/schema";
import type { RoomState } from "./types";

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
		await db
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
			});

		await db
			.update(userStats)
			.set({
				pvpMatches: sql`${userStats.pvpMatches} + 1`,
				wins: sql`${userStats.wins} + ${isWinner ? 1 : 0}`,
				avgWpmPvp: sql`(((${userStats.avgWpmPvp} * ${userStats.pvpMatches}) + ${player.wpm || 0}) / (${userStats.pvpMatches} + 1))`,
				avgAccuracyPvp: sql`(((${userStats.avgAccuracyPvp} * ${userStats.pvpMatches}) + ${accuracy}) / (${userStats.pvpMatches} + 1))`,
				highestWpm: sql`CASE WHEN ${player.wpm || 0} > ${userStats.highestWpm} THEN ${player.wpm || 0} ELSE ${userStats.highestWpm} END`,
			})
			.where(eq(userStats.userId, userId))
			.catch((err) => {
				console.error("Error updating user stats in DB:", err);
			});
	}
}
