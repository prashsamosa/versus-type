import type { ioServer } from "@versus-type/shared";
import { registerChatHandlers } from "./chat.socket";
import { authWithDuplicateCheck, cleanupUserSocket } from "./middleware";
import { registerPvpSessionHandlers } from "./pvp";

export function initializeSocket(io: ioServer) {
	io.use(authWithDuplicateCheck);
	io.on("connection", (socket) => {
		console.log("user connected: ", socket.id);
		// registerMatchmakingHandlers(socket, io);
		// registerInitHandlers(socket);
		registerPvpSessionHandlers(io, socket);
		registerChatHandlers(io, socket);

		socket.on("disconnect", () => {
			console.log("user disconnected", socket.id);
			if (socket.data.userId) {
				cleanupUserSocket(socket.data.userId);
			}
		});
		socket.on("ping", (callback) => {
			callback();
		});
	});
}
