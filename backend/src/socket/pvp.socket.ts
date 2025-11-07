import type { ioServer, ioSocket, LobbyInfo } from "@versus-type/shared";
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
	status: "inProgress" | "waiting" | "completed";
	passage: string;
	hostId: string | null;
	isStarted: boolean;
	players: { [userId: string]: PlayerState };
	// currentMatchId: string | null;
	// settings: GeneratorConfig;
};

const roomStates: Record<string, RoomState> = {};
const passageConfig: GeneratorConfig = {
	punctuation: false,
	numbers: false,
	wordCount: 50,
};

export function registerPvpSessionHandlers(io: ioServer, socket: ioSocket) {
	socket.on("pvp:join", async (data, callback) => {
		const { roomCode, username } = data;

		// roomState is non-primitive type(object), so changes will reflect in matchStates
		// UNTIL ITS UNDEFINED, so have to reassign when creating new roomState
		let roomState = roomStates[roomCode];
		let isHost = true;
		if (io.sockets.adapter.rooms.has(roomCode)) isHost = false;
		if (isHost) {
			roomState = {
				status: "waiting",
				passage: "",
				hostId: socket.data.userId,
				isStarted: false,
				players: {
					[socket.data.userId]: {
						typingIndex: 0,
						isHost: true,
						username,
						spectator: false,
						color: getRandomColor(roomCode),
						accState: resetAccuracy(),
						incorrectIdx: null,
					},
				},
			};
			roomStates[roomCode] = roomState; // have to reassign, coz its undefined before
		}

		// match status check
		const { id: roomId, status } = await roomInfo(roomCode);

		// const status = roomStates[roomCode].status; // cant do this coz we want matchId
		if (status === "notFound" || !roomId) {
			return callback({
				success: false,
				message: `Room ${roomCode} not found`,
			});
		}

		await db.insert(matchParticipants).values({
			matchId: roomId,
			ordinal: null,
			userId: socket.data.userId,
		});

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

		// TODO: in future, allow reconnection of the HOST too, ie, game won't close immediately if last one leaves
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
					isStarted: roomStates[roomCode].isStarted,
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
				console.log(`Room ${roomCode} has ended`);
				if (roomStates[roomCode]?.status !== "completed") {
					// updateMatchStatus(roomCode, "cancelled");
					deleteRoom(roomCode);
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
		if (roomStates[roomCode].isStarted) {
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
		startCountdown(io, roomCode);
		startWpmUpdates(io, roomCode);
	});

	socket.on("pvp:key-press", (key: string) => {
		const roomCode = socket.data.roomCode;
		if (!roomCode || !roomStates[roomCode]?.isStarted) {
			console.warn(
				`lol ${socket.data.userId} tryna cheat by sending key-press before starting match`,
			);
			return;
		}
		const player = roomStates[roomCode].players[socket.data.userId];
		if (player.finished) return;

		if (player.spectator) {
			console.warn(
				`spectator ${socket.data.userId} tryna send key-press during match lmao`,
			);
			return;
		}
		const passage = roomStates[roomCode].passage;

		if (!player.startedAt) player.startedAt = Date.now();

		player.accState = recordKey(
			player.accState ?? resetAccuracy(),
			key,
			passage[player.typingIndex],
		);
		if (player.incorrectIdx === null && passage[player.typingIndex] === key) {
			if (player.typingIndex >= passage.length - 1) {
				player.finished = true;
				player.wpm = calcWpm(player.typingIndex, player.startedAt);
				player.accuracy = getAccuracy(player.accState);
				sendWpmUpdate(io, roomCode);
				player.timeTyped = Date.now() - player.startedAt;

				const maxOrdinal = Object.values(roomStates[roomCode].players).reduce(
					(max, pl) => (pl.ordinal && pl.ordinal > max ? pl.ordinal : max),
					0,
				);
				player.ordinal = maxOrdinal + 1;
				if (
					player.ordinal === Object.keys(roomStates[roomCode].players).length
				) {
					completeMatch(roomCode);
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
		if (!roomCode || !roomStates[roomCode]?.isStarted) {
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
		if (!roomCode || !roomStates[roomCode]) return callback("");
		callback(roomStates[roomCode].passage);
	});
}

function calcWpm(typingIndex: number, startedAt?: number): number {
	if (!startedAt) return 0;
	const elapsedTime = Date.now() - startedAt;
	return typingIndex / 5 / (elapsedTime / 1000 / 60);
}

function startWpmUpdates(io: ioServer, roomCode: string) {
	const timeoutId = setInterval(() => {
		const roomState = roomStates[roomCode];
		if (!roomState || !roomState.isStarted) return;
		if (roomState.status === "completed") {
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
	let countdown = COUNTDOWN_SECONDS + 1;
	const countdownInterval = setInterval(() => {
		countdown--;
		io.to(roomCode).emit("pvp:countdown", countdown);
		if (countdown === 0) {
			roomStates[roomCode].isStarted = true;
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
			console.error("Error updating match status in DB:", err);
		});
	roomStates[roomCode].status = status;
}

async function deleteRoom(roomCode: string) {
	await db
		.delete(rooms)
		.where(eq(rooms.roomCode, roomCode))
		.catch((err) => {
			console.error("Error deleting room from DB:", err);
		});
	delete roomStates[roomCode];
}

function updateLobby(io: ioServer, roomCode: string, disconnectedId?: string) {
	// TODO: just emit matchStates[roomCode].players directly. update the states when events happen directly
	const room = io.sockets.adapter.rooms.get(roomCode);
	if (!room) return;
	for (const memberId of room) {
		const memberSocket = io.sockets.sockets.get(memberId);
		if (memberSocket) {
			if (!roomStates[roomCode].players[memberSocket.data.userId]) {
				roomStates[roomCode].players[memberSocket.data.userId] = {
					typingIndex: 0,
					isHost: memberSocket.data.isHost || false,
					username: memberSocket.data.username || "<Unknown>",
					spectator: roomStates[roomCode].isStarted ?? false,
					color: getRandomColor(roomCode),
					accState: resetAccuracy(),
					incorrectIdx: null,
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

async function completeMatch(roomCode: string) {
	await updateRoomStatus(roomCode, "completed");
	await updatePlayersInfoInDB(roomCode);
	console.log(`Match ${roomCode} completed`);
}

async function updatePlayersInfoInDB(roomCode: string) {
	const roomState = roomStates[roomCode];
	for (const userId in roomState.players) {
		const player = roomState.players[userId];
		if (!player.finished) continue;
		const isWinner = player.ordinal === 1 ? 1 : 0;
		const accuracy = player.accuracy ?? 0;
		await db
			.update(matchParticipants)
			.set({
				ordinal: player.ordinal,
				accuracy: accuracy,
				wpm: player.wpm || 0,
			})
			.where(eq(matchParticipants.userId, userId))
			.catch((err) => {
				console.error("Error updating match participant stats in DB:", err);
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
