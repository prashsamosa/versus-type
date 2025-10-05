export type CharCount = {
	spaces: number;
	correctWordChars: number;
	allCorrectChars: number;
	incorrectChars: number;
	extraChars: number;
	missedChars: number;
	correctSpaces: number;
};

export type TypingStats = {
	wpm: number;
	rawWpm: number;
	correctChars: number;
	incorrectChars: number;
	missedChars: number;
	extraChars: number;
	allChars: number;
	time: number;
	spaces: number;
	correctSpaces: number;
};

export function round2(n: number) {
	return Math.round(n * 100) / 100;
}

export function calculateSeconds(start: number, endOrNow?: number) {
	const end = endOrNow ?? performance.now();
	return (end - start) / 1000;
}

export function countChars(
	inputWords: string[],
	targetWords: string[],
): CharCount {
	let correctWordChars = 0;
	let correctChars = 0;
	let incorrectChars = 0;
	let extraChars = 0;
	let missedChars = 0;
	let spaces = 0;
	let correctSpaces = 0;

	const max = Math.max(inputWords.length, targetWords.length);
	for (let i = 0; i < max; i++) {
		const inputWord = inputWords[i] ?? "";
		const targetWord = targetWords[i] ?? "";

		if (inputWord.length === 0 && targetWord.length > 0) {
			missedChars += targetWord.length;
		} else if (inputWord === targetWord) {
			correctWordChars += targetWord.length;
			correctChars += targetWord.length;
			if (i < max - 1 && targetWord.length > 0) correctSpaces++;
		} else if (inputWord.length >= targetWord.length) {
			for (let c = 0; c < inputWord.length; c++) {
				if (c < targetWord.length) {
					if (inputWord[c] === targetWord[c]) correctChars++;
					else incorrectChars++;
				} else {
					extraChars++;
				}
			}
		} else {
			let localCorrect = 0;
			let localIncorrect = 0;
			let localMissed = 0;
			for (let c = 0; c < targetWord.length; c++) {
				if (c < inputWord.length) {
					if (inputWord[c] === targetWord[c]) localCorrect++;
					else localIncorrect++;
				} else {
					localMissed++;
				}
			}
			correctChars += localCorrect;
			incorrectChars += localIncorrect;
			missedChars += localMissed;
		}

		if (i < max - 1) spaces++;
	}

	return {
		spaces,
		correctWordChars,
		allCorrectChars: correctChars,
		incorrectChars,
		extraChars,
		missedChars,
		correctSpaces,
	};
}

export function computeStats(
	startTs: number,
	nowOrEndTs: number,
	inputWords: string[],
	targetWords: string[],
): TypingStats {
	const secs = calculateSeconds(startTs, nowOrEndTs);
	const t = secs <= 0 ? 1e-6 : secs;

	const chars = countChars(inputWords, targetWords);

	const gross =
		((chars.allCorrectChars +
			chars.spaces +
			chars.incorrectChars +
			chars.extraChars) *
			(60 / t)) /
		5;
	const net = ((chars.correctWordChars + chars.correctSpaces) * (60 / t)) / 5;

	const all =
		chars.allCorrectChars +
		chars.spaces +
		chars.incorrectChars +
		chars.extraChars;

	return {
		wpm: Number.isFinite(net) ? round2(net) : 0,
		rawWpm: Number.isFinite(gross) ? round2(gross) : 0,
		correctChars: chars.correctWordChars,
		incorrectChars: chars.incorrectChars,
		missedChars: chars.missedChars,
		extraChars: chars.extraChars,
		allChars: all,
		time: round2(t),
		spaces: chars.spaces,
		correctSpaces: chars.correctSpaces,
	};
}
