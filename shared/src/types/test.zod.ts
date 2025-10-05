import z from "zod";

export const TestStatsSchema = z.object({
	wpm: z.number().min(0),
	rawWpm: z.number().min(0),
	accuracy: z.number().min(0).max(100),
	correctChars: z.number().min(0),
	errorChars: z.number().min(0),
	time: z.number().min(0),
	wordsTyped: z.number().min(0),
	mode: z.enum(["time", "words"]),
});
export type TestStats = z.infer<typeof TestStatsSchema>;
