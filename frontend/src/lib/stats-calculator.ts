export interface TypingStats {
	wpm: number;
	rawWpm: number;
	accuracy: number;
	correctChars: number;
	incorrectChars: number;
}

export function calculateStats(
	passage: string,
	userInput: string,
	elapsedTimeSec: number,
): TypingStats {
	if (elapsedTimeSec === 0) {
		return {
			wpm: 0,
			rawWpm: 0,
			accuracy: 0,
			correctChars: 0,
			incorrectChars: 0,
		};
	}

	const typedChars = userInput.length;
	let correctChars = 0;

	for (let i = 0; i < typedChars; i++) {
		if (userInput[i] === passage[i]) {
			correctChars++;
		}
	}

	const incorrectChars = typedChars - correctChars;
	const timeInMinutes = elapsedTimeSec / 60;

	// WPM is based on "words" of 5 characters, including spaces.
	const wpm = Math.round(correctChars / 5 / timeInMinutes);
	const rawWpm = Math.round(typedChars / 5 / timeInMinutes);
	const accuracy =
		typedChars > 0 ? Math.round((correctChars / typedChars) * 100) : 0;

	return {
		wpm,
		rawWpm,
		accuracy,
		correctChars,
		incorrectChars,
	};
}
