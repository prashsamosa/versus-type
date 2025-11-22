import type {
	ioServer,
	ioSocket,
	LobbyInfo,
	MatchResults,
} from "@versus-type/shared";
import {
	type AccuracyState,
	getAccuracy,
	recordKey,
	resetAccuracy,
} from "@versus-type/shared/accuracy";
import {
	type GeneratorConfig,
	generateWords,
} from "@versus-type/shared/passage-generator";
import { eq, sql } from "drizzle-orm";
import { roomInfo } from "@/routes/pvp.router";
import { db } from "../db";
import {
	matches,
	matchParticipants,
	type RoomStatus,
	rooms,
	userStats,
} from "../db/schema";
import { emitNewMessage, sendChatHistory } from "./chat.socket";

const MAX_ROOM_SIZE = 10;
const COUNTDOWN_SECONDS = 3;

type PlayerState = {
	isHost?: boolean;
	username?: string;
	color: string;
	spectator: boolean;
	disconnected?: boolean;

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

type RoomState = {
	status: "inProgress" | "waiting" | "closed";
	passage: string;
	hostId: string | null;
	isMatchStarted: boolean;
	isMatchEnded: boolean;
	players: { [userId: string]: PlayerState };
	dbId: string;
	// currentMatchId: string | null;
	// settings: GeneratorConfig;
};

const roomStates: Record<string, RoomState> = {};
const passageConfig: GeneratorConfig = {
	punctuation: false,
	numbers: false,
	wordCount: 50,
};

const initialPlayerState = {
	typingIndex: 0,
	isHost: false,
	spectator: false,
	accState: resetAccuracy(),
	incorrectIdx: null,
} satisfies Partial<PlayerState>;

export function registerPvpSessionHandlers(io: ioServer, socket: ioSocket) {
	socket.on("pvp:join", async (data, callback) => {
		const { roomCode, username } = data;
		if (!roomCode) {
			return callback({
				success: false,
				message: "Room code is required",
			});
		}
		// roomState is non-primitive type(object), so changes will reflect in roomStates
		// UNTIL ITS UNDEFINED, so have to reassign when creating new roomState
		let roomState = roomStates[roomCode];
		let isHost = true;
		if (io.sockets.adapter.rooms.has(roomCode)) isHost = false;
		if (isHost) {
			const dbId = await getRoomIdFromDb(roomCode);
			if (!dbId) {
				console.warn(`Room ${roomCode} not found in DB when hosting`);
				return callback({
					success: false,
					message: `Room ${roomCode} not found`,
				});
			}
			roomState = {
				status: "waiting",
				passage: "",
				hostId: socket.data.userId,
				isMatchStarted: false,
				isMatchEnded: false,
				dbId,
				players: {
					[socket.data.userId]: {
						...initialPlayerState,
						isHost: true,
						username: username || "<Unknown>",
						color: getRandomColor(roomCode),
					},
				},
			};
			roomStates[roomCode] = roomState; // have to reassign, coz its undefined before
		}

		// room status check
		const { id: roomId, status } = await roomInfo(roomCode);

		// const status = roomStates[roomCode].status; // cant do this coz we want roomId
		if (status === "notFound" || !roomId) {
			return callback({
				success: false,
				message: `Room ${roomCode} not found`,
			});
		}

		// TODO: THINK: null match and matchParticipants before match start VS after match end

		// await db.insert(matchParticipants).values({
		//   matchId: roomStates[roomCode].currentMatchId!,
		//   ordinal: null,
		//   userId: socket.data.userId,
		// });

		socket.data.username = username;
		socket.data.roomCode = roomCode;
		if (isHost) socket.data.isHost = true;

		socket.join(roomCode);
		const room = io.sockets.adapter.rooms.get(roomCode);
		if (!isHost && room && room.size > MAX_ROOM_SIZE) {
			// why not just join AFTER check? coz it will make race conditions, if 2 join at the same time, both will pass the check
			socket.leave(roomCode);
			return callback({ success: false, message: "Room is full" });
		}

		console.log(
			isHost
				? `Match hosted with code ${roomCode} by player ${socket.id}`
				: `Player ${socket.id}(${username}) joined match with code ${roomCode}`,
		);

		// TODO: in future, allow reconnection of the HOST too, ie, room won't close immediately if last one leaves
		if (isHost) {
			roomState.passage = generateWords(passageConfig).join(" ");
			callback({
				success: true,
				message: `Room hosted with code ${roomCode}`,
			});
		} else {
			if (roomStates[roomCode].players[socket.data.userId]) {
				// reconnecting player
				roomStates[roomCode].players[socket.data.userId].disconnected = false;
				emitNewMessage(io, roomCode, {
					username: "",
					message: `${username ?? "<Unknown>"} is back`,
					system: true,
				});
				callback({
					success: true,
					message: `Reconnected to room ${roomCode}`,
					isStarted: roomStates[roomCode].isMatchStarted,
					typingIndex:
						roomStates[roomCode].players[socket.data.userId].typingIndex,
				});
			} else {
				emitNewMessage(io, roomCode, {
					username: "",
					message: `${username ?? "<Unknown>"} in da house`,
					system: true,
				});
				callback({
					success: true,
					message: `Joined room ${roomCode}`,
					isStarted: roomStates[roomCode].isMatchStarted,
				});
			}
		}

		sendChatHistory(socket, roomCode);
		updateLobby(io, roomCode);
	});

	socket.on("disconnect", () => {
		const roomCode = socket.data.roomCode;
		const username = socket.data.username;
		if (roomCode) {
			emitNewMessage(io, roomCode, {
				username: "",
				message: `${username ?? "<Unknown>"} disconnected`,
				system: true,
			});
			const room = io.sockets.adapter.rooms.get(roomCode);
			if (!room || room.size === 0) {
				console.log(`Room ${roomCode} has closed`);
				if (roomStates[roomCode]?.status !== "closed") {
					closeRoom(roomCode, io);
					// deleting rooms immediately.
					// alternative: update status to 'closed', setup cron job or setTimeout to delete closed rooms
					deleteRoomFromDB(roomCode);
				}
			} else {
				if (socket.data.isHost) {
					// change host
					let newHostId: string | null = null;
					for (const memberId of room) {
						if (memberId !== socket.id) {
							newHostId = memberId;
							break;
						}
					}
					if (!newHostId) return;

					const newHostSocket = io.sockets.sockets.get(newHostId);
					if (newHostSocket) {
						newHostSocket.data.isHost = true;
						console.log(
							`Player ${newHostSocket.id}(${newHostSocket.data.username}) is the new host of the room ${roomCode}`,
						);
						emitNewMessage(io, roomCode, {
							username: "",
							message: `${newHostSocket.data.username ?? "<Unknown>"} is the new host`,
							system: true,
						});
					}
				}
			}
			updateLobby(io, roomCode, socket.data.userId);
		}
		console.log(`Player ${socket.id}(${username}) disconnected`);
	});

	socket.on("pvp:start-match", async (callback) => {
		if (!socket.data.isHost) {
			callback({
				success: false,
				message: "Only the host can start the match",
			});
			console.warn(
				`Non-host player ${socket.id}(${socket.data.username}) tryna start match`,
			);
			return;
		}
		const roomCode = socket.data.roomCode;
		if (!roomCode) {
			callback({
				success: false,
				message: "Error starting match, join the match again",
			});
			console.warn(
				"roomCode not found in socket.data (Some sent start-match without joining)",
			);
			return;
		}
		if (roomStates[roomCode].isMatchStarted) {
			callback({
				success: false,
				message: "Match already started",
			});
			return;
		}
		await updateRoomStatus(roomCode, "inProgress");
		callback({
			success: true,
			message: "Starting countdown",
		});
		reinitializeRoomState(roomCode);
		io.to(roomCode).emit(
			"pvp:lobby-update",
			toPlayersInfo(roomStates[roomCode].players),
		);
		startCountdown(io, roomCode);
		startWpmUpdates(io, roomCode);
	});

	socket.on("pvp:key-press", (key: string) => {
		const roomCode = socket.data.roomCode;
		const roomState = roomStates[roomCode!];
		if (!roomCode || !roomState?.isMatchStarted) {
			console.warn(
				`lol ${socket.data.userId} tryna cheat by sending key-press before starting match`,
			);
			return;
		}
		const player = roomState.players[socket.data.userId];
		if (player.finished) return;

		if (player.spectator) {
			console.warn(
				`spectator ${socket.data.userId} tryna send key-press during match lmao`,
			);
			return;
		}
		const passage = roomState.passage;

		if (!player.startedAt) player.startedAt = Date.now();

		player.accState = recordKey(
			player.accState ?? resetAccuracy(),
			key,
			passage[player.typingIndex],
		);
		if (player.incorrectIdx === null && passage[player.typingIndex] === key) {
			if (player.typingIndex >= passage.length - 1) {
				// PLAYER FINISHED
				player.finished = true;
				player.wpm = calcWpm(player.typingIndex, player.startedAt);
				player.accuracy = getAccuracy(player.accState);
				sendWpmUpdate(io, roomCode);
				player.timeTyped = Date.now() - player.startedAt;

				const maxOrdinal = Object.values(roomState.players).reduce(
					(max, pl) => (pl.ordinal && pl.ordinal > max ? pl.ordinal : max),
					0,
				);
				player.ordinal = maxOrdinal + 1;
				if (
					player.ordinal ===
					Object.keys(roomState.players).reduce(
						(count, userId) =>
							roomState.players[userId].spectator ||
							roomState.players[userId].disconnected
								? count
								: count + 1,
						0,
					) // number of 'actually playing' players
				) {
					// LAST PLAYER FINISHED
					endMatch(roomCode, io);
				}

				updateLobby(io, roomCode);
			}
			io.to(roomCode).emit("pvp:progress-update", {
				userId: socket.data.userId ?? socket.id,
				typingIndex: player.typingIndex + 1,
			});
		} else if (player.incorrectIdx === null) {
			player.incorrectIdx = player.typingIndex;
		}
		player.typingIndex++;
	});

	socket.on("pvp:backspace", (amount: number) => {
		const roomCode = socket.data.roomCode;
		if (!roomCode || !roomStates[roomCode]?.isMatchStarted) {
			console.warn(
				`lol ${socket.data.userId} tryna cheat by sending backspace before starting match`,
			);
			return;
		}
		const player = roomStates[roomCode].players[socket.data.userId];
		if (player.spectator) {
			console.warn(
				`spectator ${socket.data.userId} tryna send backspace during match lmao`,
			);
			return;
		}
		player.typingIndex = Math.max(0, player.typingIndex - amount);
		if (
			player.incorrectIdx !== null &&
			player.typingIndex <= player.incorrectIdx
		) {
			player.incorrectIdx = null;
		}
		if (player.incorrectIdx == null) {
			io.to(roomCode).emit("pvp:progress-update", {
				userId: socket.data.userId || socket.id,
				typingIndex: player.typingIndex,
			});
		}
	});

	socket.on("pvp:get-passage", (callback) => {
		console.log("pvp:get-passage called by", socket.data.userId);
		const roomCode = socket.data.roomCode;
		if (!roomCode || !roomStates[roomCode])
			return callback({ passage: "", config: passageConfig });
		callback({ passage: roomStates[roomCode].passage, config: passageConfig });
	});
}

function reinitializeRoomState(roomCode: string) {
	const roomState = roomStates[roomCode];
	roomState.isMatchEnded = false;
	if (!roomState.passage) {
		roomState.passage = generateWords(passageConfig).join(" ");
	}
	roomState.status = "inProgress";

	const resetedPlayers: { [userId: string]: PlayerState } = {};
	for (const userId in roomState.players) {
		const player = roomState.players[userId];
		resetedPlayers[userId] = {
			...initialPlayerState,
			isHost: player.isHost,
			username: player.username,
			spectator: false,
			color: player.color,
		};
	}
	roomState.players = resetedPlayers;
}

function calcWpm(typingIndex: number, startedAt?: number): number {
	if (!startedAt) return 0;
	const elapsedTime = Date.now() - startedAt;
	return typingIndex / 5 / (elapsedTime / 1000 / 60);
}

function startWpmUpdates(io: ioServer, roomCode: string) {
	const timeoutId = setInterval(() => {
		const roomState = roomStates[roomCode];
		if (!roomState || !roomState.isMatchStarted) return;
		if (roomState.status === "closed" || roomState.isMatchEnded) {
			clearInterval(timeoutId);
			return;
		}
		for (const userId in roomState.players) {
			const player = roomState.players[userId];
			if (player.finished) continue;
			player.wpm = calcWpm(player.typingIndex, player.startedAt);
		}

		sendWpmUpdate(io, roomCode);
	}, 1000);
}

function sendWpmUpdate(io: ioServer, roomCode: string) {
	const wpmInfo = Object.fromEntries(
		Object.entries(roomStates[roomCode].players).map(([userId, player]) => [
			userId,
			player.wpm ?? 0,
		]),
	);

	io.to(roomCode).emit("pvp:wpm-update", wpmInfo);
}

async function startCountdown(io: ioServer, roomCode: string) {
	io.to(roomCode).emit("pvp:countdown", COUNTDOWN_SECONDS);
	let countdown = COUNTDOWN_SECONDS;
	const countdownInterval = setInterval(() => {
		countdown--;
		io.to(roomCode).emit("pvp:countdown", countdown);
		if (countdown === 0) {
			roomStates[roomCode].isMatchStarted = true;
			clearInterval(countdownInterval);
		}
	}, 1000);
}

async function updateRoomStatus(roomCode: string, status: RoomStatus) {
	await db
		.update(rooms)
		.set({ status })
		.where(eq(rooms.roomCode, roomCode))
		.catch((err) => {
			console.error("Error updating room status in DB:", err);
		});
	if (roomStates[roomCode]) roomStates[roomCode].status = status;
}

async function deleteRoomFromDB(roomCode: string) {
	await db
		.delete(rooms)
		.where(eq(rooms.roomCode, roomCode))
		.catch((err) => {
			console.error("Error deleting room from DB:", err);
		});
	delete roomStates[roomCode];
}

function updateLobby(io: ioServer, roomCode: string, disconnectedId?: string) {
	// TODO: just emit room[roomCode].players directly. update the states when events happen directly
	const room = io.sockets.adapter.rooms.get(roomCode);
	if (!room) return;
	for (const memberId of room) {
		const memberSocket = io.sockets.sockets.get(memberId);
		if (memberSocket) {
			if (!roomStates[roomCode].players[memberSocket.data.userId]) {
				roomStates[roomCode].players[memberSocket.data.userId] = {
					...initialPlayerState,
					isHost: memberSocket.data.isHost || false,
					username: memberSocket.data.username || "<Unknown>",
					spectator: roomStates[roomCode].isMatchStarted ?? false,
					color: getRandomColor(roomCode),
				};
			} else {
				// things that can update
				// host change
				if (
					memberSocket.data.isHost !==
					roomStates[roomCode].players[memberSocket.data.userId].isHost
				) {
					roomStates[roomCode].players[memberSocket.data.userId].isHost =
						memberSocket.data.isHost || false;
				}
			}
		}
	}
	if (disconnectedId) {
		roomStates[roomCode].players[disconnectedId].disconnected = true;
		roomStates[roomCode].players[disconnectedId].isHost = false;
	}
	io.to(roomCode).emit(
		"pvp:lobby-update",
		toPlayersInfo(roomStates[roomCode].players),
	);
}

async function endMatch(roomCode: string, io: ioServer) {
	await updateRoomStatus(roomCode, "closed");
	console.log(`Match in room ${roomCode} ended`);
	const matchResults: MatchResults = {};
	const roomState = roomStates[roomCode];
	for (const userId in roomState.players) {
		const player = roomState.players[userId];
		matchResults[userId] = {
			wpm: player.wpm || 0,
			accuracy: player.accuracy || 0,
			ordinal: player.ordinal || 0,
		};
	}
	roomState.isMatchStarted = false;
	roomState.isMatchEnded = true;
	roomState.status = "waiting";
	roomState.passage = generateWords(passageConfig).join(" ");
	io.to(roomCode).emit("pvp:match-ended", matchResults);

	await updatePlayersInfoInDB(roomCode);
}

async function closeRoom(roomCode: string, io: ioServer) {
	await updateRoomStatus(roomCode, "closed");
	delete roomStates[roomCode];
	io.to(roomCode).emit("pvp:disconnect", { reason: "Room closed" });
	// io.socketsLeave(roomCode);
	setTimeout(() => {
		// disconnect all clients
		const room = io.sockets.adapter.rooms.get(roomCode);
		if (room) {
			for (const memberId of room) {
				const memberSocket = io.sockets.sockets.get(memberId);
				if (memberSocket) memberSocket.disconnect();
			}
		}
	}, 3000);
	console.log(`Room ${roomCode} closed`);
}

async function updatePlayersInfoInDB(roomCode: string) {
	const roomState = roomStates[roomCode];
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

async function getRoomIdFromDb(roomCode: string): Promise<string | null> {
	const room = await db
		.select({ id: rooms.id })
		.from(rooms)
		.where(eq(rooms.roomCode, roomCode))
		.limit(1)
		.then((r) => r[0]);
	if (!room) return null;
	return room.id;
}

function toPlayersInfo(players: { [userId: string]: PlayerState }) {
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

function getRandomColor(roomCode: string) {
	const colors = [
		"#60A5FA",
		"#34D399",
		"#FBBF24",
		"#A78BFA",
		"#F472B6",
		"#F87171",
		"#818CF8",
		"#14B8A6",
	];
	let notUsed = colors.slice();
	if (roomStates[roomCode]) {
		for (const userId in roomStates[roomCode].players) {
			notUsed = notUsed.filter(
				(c) => c !== roomStates[roomCode].players[userId].color,
			);
		}
		if (notUsed.length === 0) {
			return colors[Math.floor(Math.random() * colors.length)];
		}
	}
	return notUsed[Math.floor(Math.random() * notUsed.length)];
}
