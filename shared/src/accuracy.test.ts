import { beforeEach, describe, expect, it } from "vitest";
import {
	getAccuracy,
	getErrorCount,
	recordKey,
	resetAccuracy,
} from "./accuracy";

describe("accuracy", () => {
	beforeEach(() => {
		resetAccuracy();
	});

	describe("resetAccuracy", () => {
		it("resets state to zero", () => {
			recordKey("a", "a");
			recordKey("b", "c");

			resetAccuracy();

			const result = getAccuracy();
			expect(result.correct).toBe(0);
			expect(result.incorrect).toBe(0);
			expect(result.acc).toBe(100);
		});
	});

	describe("recordKey", () => {
		it("increments correct when typed matches expected", () => {
			recordKey("a", "a");

			const result = getAccuracy();
			expect(result.correct).toBe(1);
			expect(result.incorrect).toBe(0);
		});

		it("increments incorrect when typed does not match expected", () => {
			recordKey("a", "b");

			const result = getAccuracy();
			expect(result.correct).toBe(0);
			expect(result.incorrect).toBe(1);
		});

		it("increments incorrect when no expected value provided", () => {
			recordKey("a");

			const result = getAccuracy();
			expect(result.correct).toBe(0);
			expect(result.incorrect).toBe(1);
		});

		it("does nothing when typed is empty", () => {
			recordKey("");

			const result = getAccuracy();
			expect(result.correct).toBe(0);
			expect(result.incorrect).toBe(0);
		});

		it("treat empty string expected as incorrect", () => {
			recordKey("x", "");

			const result = getAccuracy();
			expect(result.correct).toBe(0);
			expect(result.incorrect).toBe(1);
		});

		it("tracks multiple keystrokes correctly", () => {
			recordKey("h", "h");
			recordKey("e", "e");
			recordKey("l", "l");
			recordKey("l", "l");
			recordKey("x", "o");

			const result = getAccuracy();
			expect(result.correct).toBe(4);
			expect(result.incorrect).toBe(1);
		});
	});

	describe("getAccuracy", () => {
		it("returns 100% accuracy with no input", () => {
			const result = getAccuracy();

			expect(result.acc).toBe(100);
			expect(result.correct).toBe(0);
			expect(result.incorrect).toBe(0);
		});

		it("calculates accuracy percentage correctly", () => {
			recordKey("a", "a");
			recordKey("b", "b");
			recordKey("c", "d");

			const result = getAccuracy();

			expect(result.correct).toBe(2);
			expect(result.incorrect).toBe(1);
			expect(result.acc).toBeCloseTo(66.67, 1);
		});

		it("returns correct/incorrect counts", () => {
			recordKey("x", "x");
			recordKey("y", "z");
			recordKey("a", "a");

			const result = getAccuracy();

			expect(result.correct).toBe(2);
			expect(result.incorrect).toBe(1);
		});

		it("handles 0% accuracy", () => {
			recordKey("a", "b");
			recordKey("c", "d");

			const result = getAccuracy();
			expect(result.acc).toBe(0);
		});

		it("handles 100% accuracy", () => {
			recordKey("a", "a");
			recordKey("b", "b");

			const result = getAccuracy();
			expect(result.acc).toBe(100);
		});
	});

	describe("getErrorCount", () => {
		it("returns 0 initially", () => {
			expect(getErrorCount()).toBe(0);
		});

		it("returns incorrect count", () => {
			recordKey("a", "a");
			recordKey("b", "c");
			recordKey("d", "e");

			expect(getErrorCount()).toBe(2);
		});

		it("updates after reset", () => {
			recordKey("a", "b");
			expect(getErrorCount()).toBe(1);

			resetAccuracy();
			expect(getErrorCount()).toBe(0);
		});
	});
});
