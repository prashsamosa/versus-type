import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	DB_URL: z.string().url(),
	DB_AUTH_TOKEN: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_URL: z.string(),
	PORT: z.coerce.number().default(4000),
	CORS_ORIGIN: z.string(),
});

const env = envSchema.parse(process.env);
export default env;
