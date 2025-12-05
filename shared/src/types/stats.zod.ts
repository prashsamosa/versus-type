import { z } from "zod";

export const UserStatsSchema = z.object({
	soloMatches: z.number().int().nonnegative().default(0),
	pvpMatches: z.number().int().nonnegative().default(0),
	wins: z.number().int().positive().default(0),
	avgWpm: z.number().nonnegative().default(0),
	avgAccuracy: z.number().nonnegative().default(0),
	highestWpm: z.number().nonnegative().default(0),
	totalTimeTyped: z.number().int().nonnegative().default(0),
	rollingAvgWpm: z.number().nonnegative().default(0),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type StatsUpdate = Partial<UserStats>;
