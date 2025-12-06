import { App } from "uWebSockets.js";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "@versus-type/shared";
import { Server } from "socket.io";
import env from "./env";
import { initializeSocket } from "./socket";

export const uwsApp = App();

export const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(undefined, {
	cors: { origin: env.CORS_ORIGIN.split(" "), credentials: true },
	allowEIO3: true,
	cookie: { name: "io", path: "/", httpOnly: true, sameSite: "none" }, // "none" for cross-origin
});

io.attachApp(uwsApp);

initializeSocket(io);
