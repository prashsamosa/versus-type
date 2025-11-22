import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
	matches,
	matchParticipants,
	type RoomStatus,
	rooms,
	userStats,
} from "@/db/schema";
import type { RoomState } from "./types";

export async function deleteRoomFromDB(roomCode: string) {
	await db
		.delete(rooms)
		.where(eq(rooms.roomCode, roomCode))
		.catch((err) => {
			console.error("Error deleting room from DB:", err);
		});
}

export async function getRoomIdFromDb(
	roomCode: string,
): Promise<string | null> {
	const room = await db
		.select({ id: rooms.id })
		.from(rooms)
		.where(eq(rooms.roomCode, roomCode))
		.limit(1)
		.then((r) => r[0]);
	if (!room) return null;
	return room.id;
}

export async function updatePlayersInfoInDB(roomState: RoomState) {
	const matchId = await db
		.insert(matches)
		.values({
			passage: roomState.passage,
			roomId: roomState.dbId,
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

export async function updateRoomStatusInDb(
	roomCode: string,
	status: RoomStatus,
) {
	await db
		.update(rooms)
		.set({ status })
		.where(eq(rooms.roomCode, roomCode))
		.catch((err) => {
			console.error("Error updating room status in DB:", err);
		});
}
