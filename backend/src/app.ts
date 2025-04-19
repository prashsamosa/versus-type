import express from "express";
import cors from "cors";
import env from "./env";

const app = express();
app.use(
  cors({
    origin: env.CORS_ORIGIN?.split(" "),
    credentials: true,
  }),
);
app.use(express.json());
app.get("/ping", (req, res) => {
  res.send("pong");
});

export default app;
