import type { Server } from "socket.io";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData,
} from "@versus-type/types";
import { registerChatHandlers } from "./chat.socket";
import { registerPvpSessionHandlers } from "./pvp.socket";

export function initializeSocket(
	io: Server<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>,
) {
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
