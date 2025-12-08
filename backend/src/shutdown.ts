import { httpServer } from "./app";
import { broadcastShutdown } from "./socket/chat.socket";
import { io } from "./ws-server";

export let isShuttingDown = false;
const SHUTDOWN_DELAY_MS = 45 * 1000;

export async function gracefulShutdown() {
	if (isShuttingDown) {
		console.log("Force exiting immediately...");
		process.exit(1);
	}

	isShuttingDown = true;
	console.log("Shutting down gracefully... Press Ctrl+C again to force exit.");
	broadcastShutdown(io, (SHUTDOWN_DELAY_MS / 1000).toFixed(0));

	await new Promise((resolve) => setTimeout(resolve, SHUTDOWN_DELAY_MS));

	io.disconnectSockets();
	console.log("All sockets disconnected.");

	httpServer.close(() => {
		console.log("HTTP server closed.");
	});

	process.exit(0);
}
