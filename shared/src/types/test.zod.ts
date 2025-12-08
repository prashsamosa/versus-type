import z from "zod";
import { GeneratorConfigSchema } from "../passage-generator";

export const SoloStatsSchema = z.object({
	wpm: z.number().min(0),
	rawWpm: z.number().min(0),
	accuracy: z.number().min(0).max(100),
	correctChars: z.number().min(0),
	errorChars: z.number().min(0),
	time: z.number().min(0),
	wordsTyped: z.number().min(0),
	mode: z.enum(["time", "words"]),
	passageConfig: GeneratorConfigSchema,
	maxStreak: z.number().min(0),
});
export type SoloStats = z.infer<typeof SoloStatsSchema>;
