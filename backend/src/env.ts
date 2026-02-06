import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production"]),
	DB_URL: z.string(),
	DB_AUTH_TOKEN: z.string(),
	BETTER_AUTH_SECRET: z.string(),
	BETTER_AUTH_TRUSTED_ORIGINS: z.string().default("http://localhost:3000"),
	BASE_URL: z.string().default("http://localhost:4000"),
	HTTP_PORT: z.coerce.number().default(4000),
	WS_PORT: z.coerce.number().default(4001),
	CORS_ORIGIN: z.string(),
	GOOGLE_CLIENT_ID: z.string(),
	GOOGLE_CLIENT_SECRET: z.string(),
});

const env = envSchema.parse(process.env);
export default env;
