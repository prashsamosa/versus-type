import { createServer } from "node:http";
import type {
	ClientToServerEvents,
	InterServerEvents,
	ServerToClientEvents,
	SocketData,
} from "@versus-type/shared";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Server } from "socket.io";
import { auth } from "./auth/auth";
import env from "./env";
import errorHandler from "./middlewares/error.middleware";
import { pvpRouter } from "./routes/pvp.router";
import soloRouter from "./routes/solo.router";
import userRouter from "./routes/user.router";
import { initializeSocket } from "./socket";

const app = express();

app.set("trust proxy", 1);

app.use(
	cors({
		origin: env.CORS_ORIGIN.split(" "),
		credentials: true,
	}),
);

async function authMiddleware(
	req: express.Request,
	res: express.Response,
	next: express.NextFunction,
) {
	const session = await auth.api
		.getSession({
			headers: fromNodeHeaders(req.headers),
		})
		.catch(next);
	if (!session) {
		return res.status(401).json({ error: "Unauthorized" });
	}
	res.locals.session = session;
	next();
}

export const apiLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 50,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests, chill out" },
	keyGenerator: (req, res) => {
		console.log(res.locals.session?.user.id);
		return res.locals.session?.user.id || ipKeyGenerator(req.ip || "unknown");
	},
});

app.get("/ping", (_, res) => {
	res.send("pong");
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json({ limit: "16kb" }));

app.use("/api/user", authMiddleware);
app.use("/api/solo", authMiddleware);
app.use("/api/pvp/host", authMiddleware);

app.use("/api/", apiLimiter);

app.use("/api/user", userRouter);
app.use("/api/solo", soloRouter);
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
	allowEIO3: true,
	cookie: { name: "io", path: "/", httpOnly: true, sameSite: false },
});

initializeSocket(io);

export default app;
