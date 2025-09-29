import type {
	ClientToServerEvents,
	ServerToClientEvents,
	SocketData,
} from "@versus-type/types";
import { eq } from "drizzle-orm";
import type { Server, Socket } from "socket.io";
import { db } from "../db";
import { matches } from "../db/schema";
import { emitNewMessage, sendChatHistory } from "./chat.socket";

export function registerPvpSessionHandlers(
	io: Server<ClientToServerEvents, ServerToClientEvents, SocketData>,
	socket: Socket<ClientToServerEvents, ServerToClientEvents, SocketData>,
) {
	socket.on("pvp:join-as-host", (data, callback) => {
		console.log("pvp:join-as-host", data);
		const { matchCode, username } = data;
		if (io.sockets.adapter.rooms.has(matchCode)) {
			return callback({
				success: false,
				message: `Match with code: ${matchCode} is already hosted`,
			});
		}
		socket.data.username = username;
		socket.data.matchCode = matchCode;
		socket.join(matchCode);
		console.log(`Match hosted with code ${matchCode} by player ${socket.id}`);
		callback({ success: true, message: `Match hosted with code ${matchCode}` });
		sendChatHistory(socket, matchCode);
	});

	socket.on("pvp:join", (data, callback) => {
		console.log("pvp:join", data);
		const { matchCode, username } = data;
		const room = io.sockets.adapter.rooms.get(matchCode);
		if (!room) {
			return callback({ success: false, message: "Match not found" });
		}
		if (room.size >= 2) {
			return callback({ success: false, message: "Room is full" });
		}

		socket.join(matchCode);
		socket.data.username = username;
		socket.data.matchCode = matchCode;
		callback({ success: true, message: `Joined match with code ${matchCode}` });
		console.log(
			`Player ${socket.id}(${username}) joined match with code ${matchCode}`,
		);
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
		sendChatHistory(socket, matchCode);
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
