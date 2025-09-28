import type { Server, Socket } from "socket.io";

export function registerPvpSessionHandlers(io: Server, socket: Socket) {
	socket.on("pvp:host", (data, callback) => {
		const matchCode = data.matchCode;
		const username = data.username;
		if (typeof matchCode !== "string" || matchCode.length === 0) {
			return callback({ success: false, message: "Invalid match code" });
		}
		if (typeof username !== "string" || username.length === 0) {
			return callback({ success: false, message: "Invalid username" });
		}
		if (io.sockets.adapter.rooms.has(matchCode)) {
			return callback({
				success: false,
				message: `Match with code: ${matchCode} is already hosted`,
			});
		}
		socket.data.username = username;
		socket.join(matchCode);
		console.log(`Match hosted with code ${matchCode} by player ${socket.id}`);
		callback({ success: true, message: `Match hosted with code ${matchCode}` });
	});

	socket.on("pvp:join", (data, callback) => {
		const matchCode = data.matchCode;
		const username = data.username;
		if (typeof matchCode !== "string" || matchCode.length === 0) {
			return callback({ success: false, message: "Invalid match code" });
		}
		if (typeof username !== "string" || username.length === 0) {
			return callback({ success: false, message: "Invalid username" });
		}
		const room = io.sockets.adapter.rooms.get(matchCode);
		if (!room) {
			return callback({ success: false, message: "Match not found" });
		}
		if (room.size >= 2) {
			return callback({ success: false, message: "Room is full" });
		}

		socket.join(matchCode);
		socket.data.username = username;
		callback({ success: true, message: `Joined match with code ${matchCode}` });
		console.log(
			`Player ${socket.id}(${username}) joined match with code ${matchCode}`,
		);
		io.to(matchCode).emit("pvp:player-joined", {
			socketId: socket.id,
			username,
		});
	});
}
