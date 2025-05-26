import express from "express";
import cors from "cors";
import env from "./env";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./utils/auth";
import { fromNodeHeaders } from "better-auth/node";

const app = express();
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(" "),
    credentials: true,
  }),
);

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.json(session);
});

app.get("/ping", (_, res) => {
  res.send("pong");
});

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());

export default app;
