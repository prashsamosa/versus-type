import { z } from "zod";
import type { GeneratorConfig } from "../passage-generator";

export const UserStatsSchema = z.object({
	soloMatches: z.number().int().nonnegative().default(0),
	pvpMatches: z.number().int().nonnegative().default(0),
	wins: z.number().int().positive().default(0),
	avgWpm: z.number().nonnegative().default(0),
	avgAccuracy: z.number().nonnegative().default(0),
	highestWpm: z.number().nonnegative().default(0),
	totalTimeTyped: z.number().int().nonnegative().default(0),
	rollingAvgWpm: z.number().nonnegative().default(0),
	maxStreak: z.number().int().nonnegative().default(0),
});

export type UserStats = z.infer<typeof UserStatsSchema>;
export type StatsUpdate = Partial<UserStats>;

export type MatchHistoryItem = {
	id: string;
	type: "solo" | "pvp";
	wpm: number | null;
	accuracy: number | null;
	ordinal: number | null;
	passageConfig: GeneratorConfig;
	createdAt: string;
};

export type MatchHistoryResponse = {
	matches: MatchHistoryItem[];
	hasMore: boolean;
};
