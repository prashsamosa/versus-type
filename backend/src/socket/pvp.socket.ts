import type { ioServer, ioSocket, PlayerInfo } from "@versus-type/shared";
import {
	type GeneratorConfig,
	generateWords,
} from "@versus-type/shared/passage-generator";
import { eq } from "drizzle-orm";
import { matchInfo } from "@/routes/pvp.router";
import { db } from "../db";
import { matches, matchParticipants } from "../db/schema";
import { emitNewMessage, sendChatHistory } from "./chat.socket";

const MAX_ROOM_SIZE = 10;
const COUNTDOWN_SECONDS = 3;

type MatchStatus = "waiting" | "inProgress" | "completed" | "cancelled";

type MatchState = {
	status: MatchStatus;
	passage: string;
	hostId: string | null;
	isStarted?: boolean;
};
const matchStates: Record<string, MatchState> = {};
const passageConfig: GeneratorConfig = {
	punctuation: false,
	numbers: false,
	wordCount: 50,
};

export function registerPvpSessionHandlers(io: ioServer, socket: ioSocket) {
	socket.on("pvp:join-as-host", async (data, callback) => {
		await handleJoin(io, socket, data, callback, true);
	});

	socket.on("pvp:join", async (data, callback) => {
		await handleJoin(io, socket, data, callback, false);
	});

	socket.on("disconnect", () => {
		const matchCode = socket.data.matchCode;
		const username = socket.data.username;
		if (matchCode) {
			io.to(matchCode).emit("pvp:player-left", {
				userId: socket.data.userId || socket.id,
				username,
			});
			emitNewMessage(io, matchCode, {
				username: "",
				message: `${username ?? "<Unknown>"} disconnected`,
				system: true,
			});
			sendLobbyUpdate(io, matchCode);
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
						io.to(matchCode).emit("pvp:new-host", {
							userId: newHostSocket.data.userId || newHostSocket.id,
							username: newHostSocket.data.username,
						});
					}
				}
			}
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
		await updateMatchStatus(matchCode, "inProgress");
		callback({
			success: true,
			message: "Starting countdown",
		});
		startCountdown(io, matchCode);
	});
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

async function handleJoin(
	io: ioServer,
	socket: ioSocket,
	data: { matchCode: string; username: string },
	callback: (response: { success: boolean; message: string }) => void,
	isHost: boolean,
) {
	const { matchCode, username } = data;

	// matchState is non-primitive type(object), so changes will reflect in matchStates
	let matchState = matchStates[matchCode];
	if (isHost) {
		if (io.sockets.adapter.rooms.has(matchCode)) {
			return callback({
				success: false,
				message: `Match with code: ${matchCode} is already hosted`,
			});
		} else {
			matchState = {
				status: "waiting",
				passage: "",
				hostId: socket.data.userId,
			};
		}
	} else {
		if (!matchState || matchState.status !== "waiting" || !matchState.hostId) {
			return callback({
				success: false,
				message: `Match with code: ${matchCode} is not hosted yet`,
			});
		}
	}

	const { id: matchId, status } = await matchInfo(matchCode);
	if (status !== "waiting" || !matchId) {
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

	callback({
		success: true,
		message: isHost
			? `Match hosted with code ${matchCode}`
			: `Joined match with code ${matchCode}`,
	});

	if (!isHost) {
		io.to(matchCode).emit("pvp:player-joined", {
			userId: socket.data.userId || socket.id,
			username,
		});
		emitNewMessage(io, matchCode, {
			username: "",
			message: `${username ?? "<Unknown>"} in da house`,
			system: true,
		});
	} else {
		matchState.passage = generateWords(passageConfig).join(" ");
	}

	sendChatHistory(socket, matchCode);
	sendLobbyUpdate(io, matchCode);
	sendPassage(io, matchCode);
}

function sendLobbyUpdate(io: ioServer, matchCode: string) {
	const room = io.sockets.adapter.rooms.get(matchCode);
	if (!room) return;
	const players: PlayerInfo[] = [];
	for (const memberId of room) {
		const memberSocket = io.sockets.sockets.get(memberId);
		if (memberSocket) {
			players.push({
				userId: memberSocket.data.userId || memberSocket.id,
				username: memberSocket.data.username,
				isHost: memberSocket.data.isHost || false,
			} as PlayerInfo);
		}
	}
	io.to(matchCode).emit("pvp:lobby-update", players);
}

function sendPassage(io: ioServer, matchCode: string) {
	const passage = matchStates[matchCode].passage;
	if (!passage) {
		throw new Error(
			`No passage in map for ${matchCode}. How did this happen lol`,
		);
	}
	io.to(matchCode).emit("pvp:passage", passage);
}
