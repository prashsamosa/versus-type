import { createAuthMiddleware } from "better-auth/api";
import { db } from "../db";
import { userStats } from "../db/schema";

export const afterSignUpHook = createAuthMiddleware(async (ctx) => {
	if (ctx.path.startsWith("/sign-up")) {
		const newSession = ctx.context.newSession;
		if (newSession) {
			const id = newSession.user.id;
			await Promise.all([db.insert(userStats).values({ userId: id })]);
		}
	}
});
