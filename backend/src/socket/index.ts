import type { ioServer } from "@versus-type/types";
import { registerChatHandlers } from "./chat.socket";
import { registerPvpSessionHandlers } from "./pvp.socket";

export function initializeSocket(io: ioServer) {
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
