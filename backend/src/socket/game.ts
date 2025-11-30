import type { ioServer, ioSocket, MatchResults } from "@versus-type/shared";
import {
	getAccuracy,
	recordKey,
	resetAccuracy,
} from "@versus-type/shared/accuracy";
import {
	GeneratorConfigSchema,
	generatePassage,
} from "@versus-type/shared/passage-generator";
import { emitNewMessage } from "./chat.socket";
import { updatePlayersInfoInDB } from "./dbservice";
import {
	COUNTDOWN_SECONDS,
	initialPlayerState,
	participantCount,
	reinitializeRoomState,
	roomStates,
	toPlayersInfo,
	typingPlayerCount,
} from "./store";
import { calcWpm, getRandomColor } from "./utils";

export function registerPvpSessionHandlers(io: ioServer, socket: ioSocket) {
	socket.on("pvp:join", async (data, callback) => {
		const { roomCode, username } = data;
		if (!roomCode) {
			return callback({
				success: false,
				message: "Room code is required",
			});
		}
		const roomState = roomStates[roomCode];
		if (!roomState || roomState.status === "closed") {
			console.warn(`Room state for ${roomCode} not found when joining`);
			return callback({
				success: false,
				message: `Room ${roomCode} not found`,
			});
		}

		let isHost = true;
		if (io.sockets.adapter.rooms.has(roomCode)) isHost = false;

		socket.data.username = username;
		socket.data.roomCode = roomCode;

		if (isHost) socket.data.isHost = true;

		socket.join(roomCode);
		const room = io.sockets.adapter.rooms.get(roomCode);
		if (!isHost && room && room.size > roomState.maxPlayers) {
			// why not just join AFTER check? coz it will make race conditions, if 2 join at the same time, both will pass the check
			socket.leave(roomCode);
			return callback({ success: false, message: "Room is full" });
		}

		console.log(
			isHost
				? `Match hosted with code ${roomCode} by player ${socket.id}`
				: `Player ${socket.id}(${username}) joined match with code ${roomCode}`,
		);

		const player = roomStates[roomCode].players[socket.data.userId];
		let oppTypingIndexes: Record<string, number> = {};
		let reconnected = false;
		if (isHost) {
			roomState.passage = await generatePassage(roomState.passageConfig);
		} else {
			oppTypingIndexes = roomState.isMatchStarted
				? Object.fromEntries(
						Object.entries(roomState.players)
							.filter(([userId, _]) => userId !== socket.data.userId)
							.map(([userId, p]) => [userId, p.typingIndex]),
					)
				: {};
			if (player) {
				// reconnecting player
				player.disconnected = false;
				reconnected = true;
				if (roomStates[roomCode].isMatchStarted && !player.typingIndex) {
					// only set spectator if player hasn't typed yet
					player.spectator = true;
				}
				emitNewMessage(io, roomCode, {
					username: "",
					message: `${username ?? "<Unknown>"} is back`,
					system: true,
				});
			} else {
				emitNewMessage(io, roomCode, {
					username: "",
					message: `${username ?? "<Unknown>"} in da house`,
					system: true,
				});
			}
		}

		callback({
			success: true,
			message: isHost
				? `Room hosted with code ${roomCode}`
				: reconnected
					? `Reconnected to room ${roomCode}`
					: `Joined room ${roomCode}`,
			gameState: {
				isStarted: roomState.isMatchStarted,
				typingIndex: player?.typingIndex || 0,
				oppTypingIndexes,
				chatHistory: roomState.chat,
				passage: roomState.passage,
				passageConfig: roomState.passageConfig,
			},
		});

		if (!player) {
			roomState.players[socket.data.userId] = {
				...initialPlayerState,
				isHost: isHost,
				username: username || "<Unknown>",
				spectator: roomState.isMatchStarted,
				color: getRandomColor(roomCode),
			};
		}
		sendLobbyUpdate(io, roomCode);
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
			if (!roomStates[roomCode]) {
				console.warn(`disconnect: roomStates[${roomCode}] not found`);
				return;
			}
			const roomState = roomStates[roomCode];
			const room = io.sockets.adapter.rooms.get(roomCode);
			const disconnectedPlayer = roomState.players[socket.data.userId];
			if (!room || room.size === 0) {
				console.log(`Room ${roomCode} has closed`);
				if (roomState?.status !== "closed") {
					closeRoom(roomCode, io);
				}
			} else {
				if (socket.data.isHost) {
					// change host
					let newHostSocketId: string | null = null;
					for (const memberId of room) {
						if (memberId !== socket.id) {
							newHostSocketId = memberId;
							break;
						}
					}
					if (!newHostSocketId) return;

					const newHostSocket = io.sockets.sockets.get(newHostSocketId);
					if (newHostSocket) {
						const newHostUserId = newHostSocket.data.userId;
						if (!newHostUserId) return;
						newHostSocket.data.isHost = true;
						roomState.hostId = newHostUserId;
						if (!roomState.players[newHostUserId]) return;
						roomState.players[newHostUserId].isHost = true;
						disconnectedPlayer.isHost = false;
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
				sendWpmUpdate(io, roomCode);
				disconnectedPlayer.disconnected = true;
				if (
					roomState.isMatchStarted &&
					!disconnectedPlayer.finished &&
					!disconnectedPlayer.spectator &&
					typingPlayerCount(roomCode) === 0
				) {
					// LAST TYPING PLAYER DISCONNECTED
					endMatch(roomCode, io);
				}
			}
			sendLobbyUpdate(io, roomCode);
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

		const roomState = roomStates[roomCode];
		if (roomState.isMatchStarted) {
			callback({
				success: false,
				message: "Match already started",
			});
			return;
		}

		roomState.status = "inProgress";
		callback({
			success: true,
			message: "Starting countdown",
		});

		await reinitializeRoomState(roomCode);
		io.to(roomCode).emit(
			"passage:put",
			roomState.passage,
			roomState.passageConfig,
		);

		sendLobbyUpdate(io, roomCode);
		startCountdown(io, roomCode);
		startWpmUpdates(io, roomCode);

		for (const [userId] of Object.entries(roomState.players)) {
			console.log("sending reset progress of", userId);
			io.to(roomCode).emit("pvp:progress-update", {
				userId,
				typingIndex: 0,
			});
		}
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
				if (player.ordinal === participantCount(roomCode)) {
					// LAST PLAYER FINISHED
					endMatch(roomCode, io);
				}

				sendLobbyUpdate(io, roomCode);
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

	socket.on("passage:config-change", async (config) => {
		if (!socket.data.isHost) {
			console.log(
				`Non-host player ${socket.id}(${socket.data.username}) tryna change passage config`,
			);
			return;
		}
		const roomCode = socket.data.roomCode;
		if (!roomCode || !roomStates[roomCode]) {
			console.warn(
				`passage:config-change: roomState for ${roomCode} not found`,
			);
			return;
		}
		if (roomStates[roomCode].isMatchStarted) {
			console.log(
				`Host player ${socket.id}(${socket.data.username}) tryna change passage config during an ongoing match`,
			);
			return;
		}
		const result = GeneratorConfigSchema.safeParse(config);
		if (!result.success) {
			console.warn(
				`Invalid passage config from ${socket.data.userId}:`,
				result.error,
			);
			return;
		}
		const roomState = roomStates[roomCode];
		roomState.passageConfig = result.data;
		roomState.passage = await generatePassage(roomState.passageConfig);

		io.to(roomCode).emit(
			"passage:put",
			roomState.passage,
			roomState.passageConfig,
		);
	});
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
			if (player.finished || player.disconnected || player.spectator) continue;
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
			if (roomStates[roomCode]) roomStates[roomCode].isMatchStarted = true;
			clearInterval(countdownInterval);
		}
	}, 1000);
}

function sendLobbyUpdate(io: ioServer, roomCode: string) {
	if (!roomStates[roomCode]) {
		console.warn(`sendLobbyUpdate: state/players for ${roomCode} not found`);
		return;
	}
	io.to(roomCode).emit(
		"pvp:lobby-update",
		toPlayersInfo(roomStates[roomCode].players),
	);
}

async function endMatch(roomCode: string, io: ioServer) {
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
	roomState.passage = await generatePassage(roomState.passageConfig);
	io.to(roomCode).emit("pvp:match-ended", matchResults);

	await updatePlayersInfoInDB(roomState);
}

async function closeRoom(roomCode: string, io: ioServer) {
	// deleting rooms immediately.
	// alternative: update status to 'closed', setup cron job or setTimeout to delete closed rooms
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
	}, 3000); // give clients time to receive the message
	console.log(`Room ${roomCode} closed`);
}
