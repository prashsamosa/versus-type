import { httpServer } from "./app";
import env from "./env";
import { gracefulShutdown } from "./shutdown";
import { uwsApp } from "./ws-server";

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

const port = env.HTTP_PORT;
httpServer.listen(port, "0.0.0.0", () => {
	console.log(`Server is running on port ${port}`);
});

const wsPort = env.WS_PORT;
uwsApp.listen(wsPort, (token) => {
	if (token) {
		console.log(`WS Server (uWS + Socket.IO) running on port ${wsPort}`);
	} else {
		console.error(`WS Port ${wsPort} already in use`);
	}
});
