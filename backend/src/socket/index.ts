import type { ioServer } from "@versus-type/shared";
import { registerChatHandlers } from "./chat.socket";
import { registerPvpSessionHandlers } from "./game";
import { startKeyBufController } from "./keyBufSizeController";
import { authWithDuplicateCheck, cleanupUserSocket } from "./middleware";

export function initializeSocket(io: ioServer) {
	io.use(authWithDuplicateCheck);

	startKeyBufController(io);

	io.on("connection", (socket) => {
		registerPvpSessionHandlers(io, socket);
		registerChatHandlers(io, socket);

		socket.on("disconnect", () => {
			if (socket.data.userId) {
				cleanupUserSocket(socket.data.userId);
			}
		});
		socket.on("ping", (callback) => {
			callback();
		});
	});
}
