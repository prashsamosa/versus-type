import type { Server, Socket } from "socket.io";
export function registerChatHandlers(io: Server, socket: Socket) {
	socket.on("chat:send-message", (data) => {
		const username = socket.data.username;
		if (!username) {
			return socket.emit("chat:error", { message: "Username not set" });
		}
		const message = data.message;
		if (typeof message !== "string" || message.trim().length === 0) {
			return socket.emit("chat:error", { message: "Invalid message" });
		}
		const matchCode =
			socket.rooms.size > 1 ? Array.from(socket.rooms)[1] : null;
		if (!matchCode) {
			return socket.emit("chat:error", { message: "Not in a match room" });
		}

		io.to(matchCode).emit("chat:new-message", {
			username,
			message: message.trim(),
		});
	});
}
