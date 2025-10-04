import type { ioServer, ioSocket } from "@versus-type/types";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { matches } from "../db/schema";
import { matchStatus } from "../routes/pvp.router";
import { emitNewMessage, sendChatHistory } from "./chat.socket";

async function handleJoin(
	io: ioServer,
	socket: ioSocket,
	data: { matchCode: string; username: string },
	callback: (response: { success: boolean; message: string }) => void,
	isHost: boolean,
) {
	const { matchCode, username } = data;

	if (isHost) {
		if (io.sockets.adapter.rooms.has(matchCode)) {
			return callback({
				success: false,
				message: `Match with code: ${matchCode} is already hosted`,
			});
		}
	} else {
		const room = io.sockets.adapter.rooms.get(matchCode);
		if (!room) {
			return callback({ success: false, message: "Match not found" });
		}
		if (room.size >= 2) {
			return callback({ success: false, message: "Room is full" });
		}
	}

	const status = await matchStatus(matchCode);
	if (status !== "waiting") {
		return callback({
			success: false,
			message: `Match ${matchCode} is not available (${status})`,
		});
	}

	socket.data.username = username;
	socket.data.matchCode = matchCode;
	if (isHost) socket.data.isHost = true;
	socket.join(matchCode);

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
			socketId: socket.id,
			username,
		});
		emitNewMessage(io, matchCode, {
			username: "",
			message: `${username ?? "<Unknown>"} in da house`,
			system: true,
		});
		updateMatchStatus(matchCode, "inProgress");
	}

	sendChatHistory(socket, matchCode);
}

export function registerPvpSessionHandlers(io: ioServer, socket: ioSocket) {
	socket.on("pvp:join-as-host", async (data, callback) => {
		console.log("pvp:join-as-host", data);
		await handleJoin(io, socket, data, callback, true);
	});
	socket.on("pvp:join", async (data, callback) => {
		console.log("pvp:join", data);
		await handleJoin(io, socket, data, callback, false);
	});
	socket.on("disconnecting", () => {
		const matchCode = socket.data.matchCode;
		const username = socket.data.username;
		if (matchCode) {
			io.to(matchCode).emit("pvp:player-left", {
				socketId: socket.id,
				username,
			});
			emitNewMessage(io, matchCode, {
				username: "",
				message: `${username ?? "<Unknown>"} disconnected`,
				system: true,
			});
			const room = io.sockets.adapter.rooms.get(matchCode);
			if (!room || room.size === 0) {
				console.log(`Match with code ${matchCode} has ended`);
				// TODO: decide cancelled or completed instead of always cancelled
				updateMatchStatus(matchCode, "cancelled");
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
							socketId: newHostSocket.id,
							username: newHostSocket.data.username,
						});
					}
				}
			}
		}
		console.log(`Player ${socket.id}(${username}) disconnected`);
	});
}

async function updateMatchStatus(
	matchCode: string,
	status: "waiting" | "inProgress" | "completed" | "cancelled",
) {
	db.update(matches).set({ status }).where(eq(matches.matchCode, matchCode));
}
