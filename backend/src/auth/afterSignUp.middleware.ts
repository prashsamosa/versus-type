import { createAuthMiddleware } from "better-auth/api";
import { db } from "../db";
import { userSettings, userStats } from "../db/schema";

export const afterSignUpHook = createAuthMiddleware(async (ctx) => {
  if (ctx.path.startsWith("/sign-up")) {
    const newSession = ctx.context.newSession;
    if (newSession) {
      const id = newSession.user.id;
      Promise.all([
        db.insert(userSettings).values({ userId: id }),
        db.insert(userStats).values({ userId: id }),
      ]);
      // other values are set by database defaults
    }
  }
});
