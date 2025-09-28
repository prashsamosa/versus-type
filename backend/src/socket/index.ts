import type { Server } from "socket.io";
import { registerChatHandlers } from "./chat.socket";
import { registerPvpSessionHandlers } from "./pvp.socket";

export function initializeSocket(io: Server) {
	io.on("connection", (socket) => {
		console.log("user connected: ", socket.id);
		// registerMatchmakingHandlers(socket, io);
		// registerInitHandlers(socket);
		registerPvpSessionHandlers(io, socket);
		registerChatHandlers(io, socket);

		socket.on("disconnect", () => {
			console.log("user disconnected", socket.id);
		});
	});
}
