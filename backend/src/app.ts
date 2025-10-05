import { createServer } from "node:http";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "@versus-type/shared";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { auth } from "./auth/auth";
import env from "./env";
import errorHandler from "./middlewares/error.middleware";
import { pvpRouter } from "./routes/pvp.router";
import testRouter from "./routes/test.router";
import userRouter from "./routes/user.router";
import { initializeSocket } from "./socket";

const app = express();
app.use(
	cors({
		origin: env.CORS_ORIGIN.split(" "),
		credentials: true,
	}),
);

app.get("/ping", (_, res) => {
	res.send("pong");
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "16kb" }));
app.use("/api/user", userRouter);
app.use("/api/test", testRouter);
app.use("/api/pvp", pvpRouter);
app.use(errorHandler);

export const httpServer = createServer(app);
export const io = new Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>(httpServer, {
	cors: { origin: env.CORS_ORIGIN.split(" "), credentials: true },
});

initializeSocket(io);

export default app;
