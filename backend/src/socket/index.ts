import type { ioServer } from "@versus-type/shared";
import { isShuttingDown } from "@/shutdown";
import { registerChatHandlers } from "./chat.socket";
import { registerPvpSessionHandlers } from "./game";
import { startKeyBufController } from "./keyBufSizeController";
import { authWithDuplicateCheck, removeFromUserSocket } from "./middleware";

export function initializeSocket(io: ioServer) {
	io.use((_, next) => {
		if (isShuttingDown) {
			return next(new Error("Server is restarting, please try again later."));
		}
		next();
	});

	io.use(authWithDuplicateCheck);

	startKeyBufController(io);

	io.on("connection", (socket) => {
		registerPvpSessionHandlers(io, socket);
		registerChatHandlers(io, socket);

		socket.on("disconnect", () => {
			if (socket.data.userId) {
				removeFromUserSocket(socket.data.userId);
			}
		});
		socket.on("ping", (callback) => {
			callback();
		});
	});
}
