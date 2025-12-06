export type CharCount = {
	correctChars: number; // includes correct spaces
	incorrectChars: number;
	// extraChars: number;
	// missedChars: number;
};

export type TypingStats = {
	wpm: number;
	rawWpm: number;
	correctChars: number;
	incorrectChars: number;
	allChars: number;
	time: number;
};

export function round2Decimal(n: number) {
	return Math.round(n * 100) / 100;
}

export function calculateSeconds(start: number, endOrNow?: number) {
	const end = endOrNow ?? performance.now();
	return (end - start) / 1000;
}

export function countChars(
	inputString: string,
	targetString: string,
): CharCount {
	// Char-level sequential comparison (includes spaces)
	const minLen = Math.min(inputString.length, targetString.length);
	let correctChars = 0;
	let incorrectChars = 0;
	for (let i = 0; i < minLen; i++) {
		if (inputString[i] === targetString[i]) {
			correctChars++;
		} else {
			incorrectChars++;
		}
	}
	const extraChars = inputString.length - minLen;
	// const missedChars = targetString.length - minLen;
	incorrectChars += extraChars;

	return {
		correctChars,
		incorrectChars,
	};
}

export function computeStats(
	startTs: number,
	nowOrEndTs: number,
	inputString: string,
	targetString: string,
): TypingStats | null {
	const secs = calculateSeconds(startTs, nowOrEndTs || undefined);
	if (secs <= 0) {
		console.warn("computeStats called with non-positive time");
		return null;
	}

	const chars = countChars(inputString, targetString);

	// Raw WPM: all typed chars (direct from string length)
	const gross = (inputString.length * (60 / secs)) / 5;

	// Net WPM: correct chars
	const net = (chars.correctChars * (60 / secs)) / 5;

	return {
		wpm: Number.isFinite(net) ? round2Decimal(net) : 0,
		rawWpm: Number.isFinite(gross) ? round2Decimal(gross) : 0,
		correctChars: chars.correctChars,
		incorrectChars: chars.incorrectChars,
		allChars: inputString.length,
		time: round2Decimal(secs),
	};
}
