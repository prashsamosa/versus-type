export type AccuracyState = { correct: number; incorrect: number };

const state: AccuracyState = { correct: 0, incorrect: 0 };

export function resetAccuracy(): void {
	state.correct = 0;
	state.incorrect = 0;
}

export function recordKey(typed: string, expected?: string): void {
	if (typed.length > 1 || typed.length === 0) {
		console.warn("recordKey should be called with a single character");
		return;
	}

	if (expected && typed === expected) state.correct++;
	else state.incorrect++;
}

export function getAccuracy(): {
	correct: number;
	incorrect: number;
	acc: number;
} {
	const den = state.correct + state.incorrect;
	const acc = den > 0 ? (state.correct / den) * 100 : 100;
	return { correct: state.correct, incorrect: state.incorrect, acc };
}

export function getErrorCount(): number {
	return state.incorrect;
}
