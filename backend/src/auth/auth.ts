import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import env from "@/env";
import { db } from "../db/index";
import * as schema from "../db/schema";
import { afterSignUpHook } from "./afterSignUp.middleware";

export const auth = betterAuth({
	trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS.split(" "),
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [anonymous()],
	hooks: {
		after: afterSignUpHook,
	},
});
