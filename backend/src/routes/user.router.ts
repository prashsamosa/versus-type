import { fromNodeHeaders } from "better-auth/node";
import { Router } from "express";
import { auth } from "../auth/auth";

const userRouter = Router();

userRouter.get("/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  res.json(session);
});

export default userRouter;
