import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DB_URL: z.string().url(),
  DB_AUTH_TOKEN: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().url(),
});

const env = envSchema.parse(process.env);
export default env;
