import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { anonymous } from "better-auth/plugins";
import { db } from "../db/index";
import * as schema from "../db/schema";
import { afterSignUpHook } from "./afterSignUp.middleware";

export const auth = betterAuth({
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
