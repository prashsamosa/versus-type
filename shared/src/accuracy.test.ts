import { describe, expect, it } from "vitest";
import {
	getAccuracy,
	getErrorCount,
	recordKey,
	resetAccuracy,
} from "./accuracy";

describe("accuracy", () => {
	describe("resetAccuracy", () => {
		it("resets state to zero", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "a");
			state = recordKey(state, "b", "c");

			state = resetAccuracy();

			const result = getAccuracy(state);
			expect(state.correct).toBe(0);
			expect(state.incorrect).toBe(0);
			expect(result).toBe(100);
		});
	});

	describe("recordKey", () => {
		it("increments correct when typed matches expected", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "a");

			expect(state.correct).toBe(1);
			expect(state.incorrect).toBe(0);
		});

		it("increments incorrect when typed does not match expected", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "b");

			expect(state.correct).toBe(0);
			expect(state.incorrect).toBe(1);
		});

		it("increments incorrect when no expected value provided", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a");

			expect(state.correct).toBe(0);
			expect(state.incorrect).toBe(1);
		});

		it("does nothing when typed is empty", () => {
			let state = resetAccuracy();
			state = recordKey(state, "");

			expect(state.correct).toBe(0);
			expect(state.incorrect).toBe(0);
		});

		it("treat empty string expected as incorrect", () => {
			let state = resetAccuracy();
			state = recordKey(state, "x", "");

			expect(state.correct).toBe(0);
			expect(state.incorrect).toBe(1);
		});

		it("tracks multiple keystrokes correctly", () => {
			let state = resetAccuracy();
			state = recordKey(state, "h", "h");
			state = recordKey(state, "e", "e");
			state = recordKey(state, "l", "l");
			state = recordKey(state, "l", "l");
			state = recordKey(state, "x", "o");

			expect(state.correct).toBe(4);
			expect(state.incorrect).toBe(1);
		});
	});

	describe("getAccuracy", () => {
		it("returns 100% accuracy with no input", () => {
			const state = resetAccuracy();
			const result = getAccuracy(state);

			expect(result).toBe(100);
			expect(state.correct).toBe(0);
			expect(state.incorrect).toBe(0);
		});

		it("calculates accuracy percentage correctly", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "a");
			state = recordKey(state, "b", "b");
			state = recordKey(state, "c", "d");

			const result = getAccuracy(state);

			expect(state.correct).toBe(2);
			expect(state.incorrect).toBe(1);
			expect(result).toBeCloseTo(66.67, 1);
		});

		it("returns correct/incorrect counts", () => {
			let state = resetAccuracy();
			state = recordKey(state, "x", "x");
			state = recordKey(state, "y", "z");
			state = recordKey(state, "a", "a");

			expect(state.correct).toBe(2);
			expect(state.incorrect).toBe(1);
		});

		it("handles 0% accuracy", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "b");
			state = recordKey(state, "c", "d");

			const result = getAccuracy(state);
			expect(result).toBe(0);
		});

		it("handles 100% accuracy", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "a");
			state = recordKey(state, "b", "b");

			const result = getAccuracy(state);
			expect(result).toBe(100);
		});
	});

	describe("getErrorCount", () => {
		it("returns 0 initially", () => {
			const state = resetAccuracy();
			expect(getErrorCount(state)).toBe(0);
		});

		it("returns incorrect count", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "a");
			state = recordKey(state, "b", "c");
			state = recordKey(state, "d", "e");

			expect(getErrorCount(state)).toBe(2);
		});

		it("updates after reset", () => {
			let state = resetAccuracy();
			state = recordKey(state, "a", "b");
			expect(getErrorCount(state)).toBe(1);

			state = resetAccuracy();
			expect(getErrorCount(state)).toBe(0);
		});
	});
});
