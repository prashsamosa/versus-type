import express from "express";
import cors from "cors";
import env from "./env";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/auth";
import userRouter from "./routes/user.router";

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

export default app;
