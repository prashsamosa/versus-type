import { drizzle } from "drizzle-orm/libsql";
import "dotenv/config";

export const db = drizzle({
	connection: {
		url: process.env.DB_URL!,
		authToken: process.env.DB_AUTH_TOKEN,
	},
});
