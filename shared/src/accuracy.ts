export type AccuracyState = { correct: number; incorrect: number };

export function resetAccuracy(): AccuracyState {
	return { correct: 0, incorrect: 0 };
}

export function recordKey(
	state: AccuracyState,
	typed: string,
	expected?: string,
): AccuracyState {
	if (typed.length > 1 || typed.length === 0) {
		console.warn("recordKey should be called with a single character");
		return state;
	}
	const newState = { ...state };
	if (expected && typed === expected) {
		newState.correct++;
	} else newState.incorrect++;
	return newState;
}

export function getAccuracy(state: AccuracyState): {
	correct: number;
	incorrect: number;
	acc: number;
} {
	const den = state.correct + state.incorrect;
	const acc = den > 0 ? (state.correct / den) * 100 : 100;
	return { correct: state.correct, incorrect: state.incorrect, acc };
}

export function getErrorCount(state: AccuracyState): number {
	return state.incorrect;
}
