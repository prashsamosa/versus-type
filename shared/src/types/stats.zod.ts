import { z } from "zod";

export const StatsSchema = z.object({
	soloMatches: z.number().int().nonnegative().default(0),
	pvpMatches: z.number().int().nonnegative().default(0),
	wins: z.number().int().positive().default(0),
	avgWpmPvp: z.number().nonnegative().default(0),
	avgAccuracyPvp: z.number().nonnegative().default(0),
	highestWpm: z.number().nonnegative().default(0),
	totalTimePlayed: z.number().int().nonnegative().default(0),
	wordsTyped: z.number().int().nonnegative().default(0),
});

export type Stats = z.infer<typeof StatsSchema>;
export type StatsUpdate = Partial<Stats>;
