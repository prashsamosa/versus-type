import { useEffect, useRef, useState } from "react";
import { calculateStats, type TypingStats } from "@/lib/stats-calculator";

const INITIAL_STATS: TypingStats = {
	wpm: 0,
	rawWpm: 0,
	accuracy: 0,
	correctChars: 0,
	incorrectChars: 0,
};

/**
 * A custom hook to manage and calculate typing test statistics in real-time.
 * @param passage - The text for the typing test.
 * @param userInput - The current input from the user.
 * @returns The calculated typing statistics.
 */
export function useTypingStats(
	passage: string,
	userInput: string,
): TypingStats {
	const [stats, setStats] = useState<TypingStats>(INITIAL_STATS);
	const startTimeRef = useRef<number | null>(null);

	useEffect(() => {
		// Reset stats and timer if input is cleared
		if (!userInput) {
			startTimeRef.current = null;
			setStats(INITIAL_STATS);
			return;
		}

		// Start the timer on the first character typed
		if (startTimeRef.current === null) {
			startTimeRef.current = performance.now();
		}

		// Calculate elapsed time
		const elapsedTimeSec =
			(performance.now() - (startTimeRef.current ?? 0)) / 1000;

		// Update stats by calling the pure calculator function
		const newStats = calculateStats(passage, userInput, elapsedTimeSec);
		setStats(newStats);
	}, [userInput, passage]);

	return stats;
}
