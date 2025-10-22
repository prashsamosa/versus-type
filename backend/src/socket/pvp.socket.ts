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
import { matchInfo } from "@/routes/pvp.router";
import { db } from "../db";
import { matches, matchParticipants, userStats } from "../db/schema";
import { emitNewMessage, sendChatHistory } from "./chat.socket";

const MAX_ROOM_SIZE = 10;
const COUNTDOWN_SECONDS = 3;

type MatchStatus = "waiting" | "inProgress" | "completed" | "cancelled";

type PlayerState = {
	isHost?: boolean;
	username?: string;
	color: string;
	typingIndex: number;
	wpm?: number;
	startedAt?: number;
	accuracy?: number;
	accState?: AccuracyState;
	spectator: boolean;
	finished?: boolean;
	timeTyped?: number;
	ordinal?: number;
	disconnected?: boolean;
};

type MatchState = {
	status: MatchStatus;
	passage: string;
	hostId: string | null;
	isStarted: boolean;
	players: { [userId: string]: PlayerState };
};
const matchStates: Record<string, MatchState> = {};
const passageConfig: GeneratorConfig = {
	punctuation: false,
	numbers: false,
	wordCount: 50,
};

export function registerPvpSessionHandlers(io: ioServer, socket: ioSocket) {
	socket.on("pvp:join", async (data, callback) => {
		const { matchCode, username } = data;

		// matchState is non-primitive type(object), so changes will reflect in matchStates
		// UNTIL ITS UNDEFINED, so have to reassign when creating new matchState
		let matchState = matchStates[matchCode];
		let isHost = true;
		if (io.sockets.adapter.rooms.has(matchCode)) isHost = false;
		if (isHost) {
			matchState = {
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
						color: getRandomColor(matchCode),
						accState: resetAccuracy(),
					},
				},
			};
			matchStates[matchCode] = matchState; // have to reassign, coz its undefined before
		}

		// match status check
		const { id: matchId, status } = await matchInfo(matchCode);

		// const status = matchStates[matchCode].status; // cant do this coz we want matchId
		if (status === "notFound" || status === "expired" || !matchId) {
			return callback({
				success: false,
				message: `Match ${matchCode} is not available (${status})`,
			});
		}

		await db.insert(matchParticipants).values({
			matchId,
			disconnected: false,
			isWinner: false,
			userId: socket.data.userId,
		});

		socket.data.username = username;
		socket.data.matchCode = matchCode;
		if (isHost) socket.data.isHost = true;

		socket.join(matchCode);
		const room = io.sockets.adapter.rooms.get(matchCode);
		if (!isHost && room && room.size > MAX_ROOM_SIZE) {
			// why not just join AFTER check? coz it will make race conditions, if 2 join at the same time, both will pass the check
			socket.leave(matchCode);
			return callback({ success: false, message: "Room is full" });
		}

		console.log(
			isHost
				? `Match hosted with code ${matchCode} by player ${socket.id}`
				: `Player ${socket.id}(${username}) joined match with code ${matchCode}`,
		);

		// TODO: in future, allow reconnection of the HOST too, ie, game won't close immediately if last one leaves
		if (isHost) {
			matchState.passage = generateWords(passageConfig).join(" ");
			callback({
				success: true,
				message: `Match hosted with code ${matchCode}`,
			});
		} else {
			if (matchStates[matchCode].players[socket.data.userId]) {
				// reconnecting player
				matchStates[matchCode].players[socket.data.userId].disconnected = false;
				emitNewMessage(io, matchCode, {
					username: "",
					message: `${username ?? "<Unknown>"} is back`,
					system: true,
				});
				callback({
					success: true,
					message: `Reconnected to match ${matchCode}`,
					isStarted: matchStates[matchCode].isStarted,
					typingIndex:
						matchStates[matchCode].players[socket.data.userId].typingIndex,
				});
			} else {
				emitNewMessage(io, matchCode, {
					username: "",
					message: `${username ?? "<Unknown>"} in da house`,
					system: true,
				});
				callback({
					success: true,
					message: `Joined match ${matchCode}`,
				});
			}
		}

		sendChatHistory(socket, matchCode);
		updateLobby(io, matchCode);
	});

	socket.on("disconnect", () => {
		const matchCode = socket.data.matchCode;
		const username = socket.data.username;
		if (matchCode) {
			emitNewMessage(io, matchCode, {
				username: "",
				message: `${username ?? "<Unknown>"} disconnected`,
				system: true,
			});
			const room = io.sockets.adapter.rooms.get(matchCode);
			if (!room || room.size === 0) {
				console.log(`Match with code ${matchCode} has ended`);
				if (matchStates[matchCode]?.status !== "completed") {
					updateMatchStatus(matchCode, "cancelled");
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
							`Player ${newHostSocket.id}(${newHostSocket.data.username}) is the new host of match ${matchCode}`,
						);
						emitNewMessage(io, matchCode, {
							username: "",
							message: `${newHostSocket.data.username ?? "<Unknown>"} is the new host`,
							system: true,
						});
					}
				}
			}
			updateLobby(io, matchCode, socket.data.userId);
		}
		console.log(`Player ${socket.id}(${username}) disconnected`);
	});

	socket.on("pvp:start-match", async (callback) => {
		const matchCode = socket.data.matchCode;
		if (!matchCode) {
			callback({
				success: false,
				message: "Error starting match, join the match again",
			});
			console.warn(
				"MatchCode not found in socket.data (Some sent start-match without joining)",
			);
			return;
		}
		if (matchStates[matchCode].isStarted) {
			callback({
				success: false,
				message: "Match already started",
			});
			return;
		}
		await updateMatchStatus(matchCode, "inProgress");
		callback({
			success: true,
			message: "Starting countdown",
		});
		startCountdown(io, matchCode);
		startWpmUpdates(io, matchCode);
	});

	socket.on("pvp:key-press", (key: string) => {
		const matchCode = socket.data.matchCode;
		if (!matchCode || !matchStates[matchCode]?.isStarted) {
			console.warn(
				`lol ${socket.data.userId} tryna cheat by sending key-press before starting match`,
			);
			return;
		}
		const player = matchStates[matchCode].players[socket.data.userId];
		if (player.finished) return;

		if (player.spectator) {
			console.warn(
				`spectator ${socket.data.userId} tryna send key-press during match lmao`,
			);
			return;
		}
		const passage = matchStates[matchCode].passage;

		if (!player.startedAt) player.startedAt = Date.now();

		player.accState = recordKey(
			player.accState ?? resetAccuracy(),
			key,
			passage[player.typingIndex],
		);
		if (passage[player.typingIndex] === key) {
			player.typingIndex++;
			if (player.typingIndex >= passage.length) {
				player.finished = true;
				player.wpm = calcWpm(player.typingIndex, player.startedAt);
				player.accuracy = getAccuracy(player.accState);
				sendWpmUpdate(io, matchCode);
				player.timeTyped = Date.now() - player.startedAt;

				const maxOrdinal = Object.values(matchStates[matchCode].players).reduce(
					(max, pl) => (pl.ordinal && pl.ordinal > max ? pl.ordinal : max),
					0,
				);
				player.ordinal = maxOrdinal + 1;
				if (
					player.ordinal === Object.keys(matchStates[matchCode].players).length
				) {
					completeMatch(matchCode);
				}

				updateLobby(io, matchCode);
			}
			io.to(matchCode).emit("pvp:progress-update", {
				userId: socket.data.userId ?? socket.id,
				typingIndex: player.typingIndex,
			});
		}
	});

	socket.on("pvp:backspace", (amount: number) => {
		const matchCode = socket.data.matchCode;
		if (!matchCode || !matchStates[matchCode]?.isStarted) {
			console.warn(
				`lol ${socket.data.userId} tryna cheat by sending backspace before starting match`,
			);
			return;
		}
		const pstate = matchStates[matchCode].players[socket.data.userId];
		if (pstate.spectator) {
			console.warn(
				`spectator ${socket.data.userId} tryna send backspace during match lmao`,
			);
			return;
		}
		pstate.typingIndex = Math.max(0, pstate.typingIndex - amount);
		io.to(matchCode).emit("pvp:progress-update", {
			userId: socket.data.userId || socket.id,
			typingIndex: pstate.typingIndex,
		});
	});

	socket.on("pvp:get-passage", (callback) => {
		console.log("pvp:get-passage called by", socket.data.userId);
		const matchCode = socket.data.matchCode;
		if (!matchCode || !matchStates[matchCode]) return callback("");
		callback(matchStates[matchCode].passage);
	});
}

function calcWpm(typingIndex: number, startedAt?: number): number {
	if (!startedAt) return 0;
	const elapsedTime = Date.now() - startedAt;
	return typingIndex / 5 / (elapsedTime / 1000 / 60);
}

function startWpmUpdates(io: ioServer, matchCode: string) {
	const timeoutId = setInterval(() => {
		const matchState = matchStates[matchCode];
		if (!matchState || !matchState.isStarted) return;
		if (
			matchState.status === "completed" ||
			matchState.status === "cancelled"
		) {
			clearInterval(timeoutId);
			return;
		}
		for (const userId in matchState.players) {
			const player = matchState.players[userId];
			if (player.finished) continue;
			player.wpm = calcWpm(player.typingIndex, player.startedAt);
		}

		sendWpmUpdate(io, matchCode);
	}, 1000);
}

function sendWpmUpdate(io: ioServer, matchCode: string) {
	const wpmInfo = Object.fromEntries(
		Object.entries(matchStates[matchCode].players).map(([userId, player]) => [
			userId,
			player.wpm ?? 0,
		]),
	);

	io.to(matchCode).emit("pvp:wpm-update", wpmInfo);
}

async function startCountdown(io: ioServer, matchCode: string) {
	let countdown = COUNTDOWN_SECONDS + 1;
	const countdownInterval = setInterval(() => {
		countdown--;
		io.to(matchCode).emit("pvp:countdown", countdown);
		if (countdown === 0) {
			matchStates[matchCode].isStarted = true;
			clearInterval(countdownInterval);
		}
	}, 1000);
}

async function updateMatchStatus(matchCode: string, status: MatchStatus) {
	await db
		.update(matches)
		.set({ status })
		.where(eq(matches.matchCode, matchCode))
		.catch((err) => {
			console.error("Error updating match status in DB:", err);
		});
	matchStates[matchCode].status = status;
}

function updateLobby(io: ioServer, matchCode: string, disconnectedId?: string) {
	// TODO: just emit matchStates[matchCode].players directly. update the states when events happen directly
	const room = io.sockets.adapter.rooms.get(matchCode);
	if (!room) return;
	for (const memberId of room) {
		const memberSocket = io.sockets.sockets.get(memberId);
		if (memberSocket) {
			if (!matchStates[matchCode].players[memberSocket.data.userId]) {
				matchStates[matchCode].players[memberSocket.data.userId] = {
					typingIndex: 0,
					isHost: memberSocket.data.isHost || false,
					username: memberSocket.data.username || "<Unknown>",
					spectator: matchStates[matchCode].isStarted ?? false,
					color: getRandomColor(matchCode),
					accState: resetAccuracy(),
				};
			} else {
				// things that can update
				// host change
				if (
					memberSocket.data.isHost !==
					matchStates[matchCode].players[memberSocket.data.userId].isHost
				) {
					matchStates[matchCode].players[memberSocket.data.userId].isHost =
						memberSocket.data.isHost || false;
				}
			}
		}
	}
	if (disconnectedId) {
		matchStates[matchCode].players[disconnectedId].disconnected = true;
		matchStates[matchCode].players[disconnectedId].isHost = false;
	}
	io.to(matchCode).emit(
		"pvp:lobby-update",
		toPlayersInfo(matchStates[matchCode].players),
	);
}

async function completeMatch(matchCode: string) {
	await updateMatchStatus(matchCode, "completed");
	await updatePlayersInfoInDB(matchCode);
	console.log(`Match ${matchCode} completed`);
}

async function updatePlayersInfoInDB(matchCode: string) {
	const matchState = matchStates[matchCode];
	for (const userId in matchState.players) {
		const player = matchState.players[userId];
		if (!player.finished) continue;
		const isWinner = player.ordinal === 1 ? 1 : 0;
		const accuracy = player.accuracy ?? 0;
		await db
			.update(matchParticipants)
			.set({
				isWinner: isWinner === 1,
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

function getRandomColor(matchCode: string) {
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
	if (matchStates[matchCode]) {
		for (const userId in matchStates[matchCode].players) {
			notUsed = notUsed.filter(
				(c) => c !== matchStates[matchCode].players[userId].color,
			);
		}
		if (notUsed.length === 0) {
			return colors[Math.floor(Math.random() * colors.length)];
		}
	}
	return notUsed[Math.floor(Math.random() * notUsed.length)];
}
