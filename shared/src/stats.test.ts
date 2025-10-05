import { describe, expect, it } from "vitest";
import {
	type CharCount,
	computeStats,
	countChars,
	type TypingStats,
} from "./stats";

describe("countChars", () => {
	it("should return correct count for exact match without spaces", () => {
		const result: CharCount = countChars("hello", "hello");
		expect(result.correctChars).toBe(5);
		expect(result.incorrectChars).toBe(0);
	});

	it("should return correct count for exact match with spaces", () => {
		const result: CharCount = countChars("hello world", "hello world");
		expect(result.correctChars).toBe(11);
		expect(result.incorrectChars).toBe(0);
	});

	it("should count correct characters including spaces and handle mismatches", () => {
		const result: CharCount = countChars("helo world", "hello world");
		expect(result.correctChars).toBe(3); // h, e, l correct; mismatch on fourth 'o' vs 'l', and all subsequent chars wrong due to misalignment
		expect(result.incorrectChars).toBe(7);
	});

	it("should handle extra characters in input", () => {
		const result: CharCount = countChars("hello world!", "hello world");
		expect(result.correctChars).toBe(11);
		expect(result.incorrectChars).toBe(1);
	});

	it("should handle shorter input", () => {
		const result: CharCount = countChars("hello", "hello world");
		expect(result.correctChars).toBe(5);
		expect(result.incorrectChars).toBe(0);
	});

	it("should handle empty input and target", () => {
		const result: CharCount = countChars("", "");
		expect(result.correctChars).toBe(0);
		expect(result.incorrectChars).toBe(0);
	});

	it("should handle empty input with non-empty target", () => {
		const result: CharCount = countChars("", "hello");
		expect(result.correctChars).toBe(0);
		expect(result.incorrectChars).toBe(0);
	});

	it("should handle non-empty input with empty target", () => {
		const result: CharCount = countChars("hello", "");
		expect(result.correctChars).toBe(0);
		expect(result.incorrectChars).toBe(5);
	});
});

describe("computeStats", () => {
	const mockStartTs = performance.now() - 5000; // 5 seconds ago
	const mockEndTs = performance.now();

	it("should compute stats for exact match", () => {
		const result: TypingStats | null = computeStats(
			mockStartTs,
			mockEndTs,
			"hello world",
			"hello world",
		);
		expect(result).not.toBeNull();
		expect(result!.wpm).toBeCloseTo((11 / 5 / 5) * 60, 1); // ~26.4
		expect(result!.rawWpm).toBeCloseTo((11 / 5 / 5) * 60, 1);
		expect(result!.correctChars).toBe(11);
		expect(result!.incorrectChars).toBe(0);
		expect(result!.allChars).toBe(11);
		expect(result!.time).toBeCloseTo(5, 1);
	});

	it("should compute stats with mismatches", () => {
		const result: TypingStats | null = computeStats(
			mockStartTs,
			mockEndTs,
			"helo world",
			"hello world",
		);
		expect(result).not.toBeNull();
		expect(result!.correctChars).toBe(3);
		expect(result!.incorrectChars).toBe(7);
		expect(result!.allChars).toBe(10);
		expect(result!.wpm).toBeCloseTo((3 / 5 / 5) * 60, 1); // ~7.2
		expect(result!.rawWpm).toBeCloseTo((10 / 5 / 5) * 60, 1); // ~24
		expect(result!.time).toBeCloseTo(5, 1);
	});

	it("should return null for zero or negative time", () => {
		const futureStart = performance.now() + 1000;
		const result: TypingStats | null = computeStats(
			futureStart,
			performance.now(),
			"hello",
			"hello",
		);
		expect(result).toBeNull();
	});

	it("should handle empty strings", () => {
		const result: TypingStats | null = computeStats(
			mockStartTs,
			mockEndTs,
			"",
			"",
		);
		expect(result).not.toBeNull();
		expect(result!.wpm).toBe(0);
		expect(result!.rawWpm).toBe(0);
		expect(result!.correctChars).toBe(0);
		expect(result!.incorrectChars).toBe(0);
		expect(result!.allChars).toBe(0);
		expect(result!.time).toBeCloseTo(5, 1);
	});

	it("should use now if endTs not provided", () => {
		const startTs = performance.now() - 2000; // 2 seconds ago
		const result: TypingStats | null = computeStats(startTs, 0, "hi", "hi");
		expect(result).not.toBeNull();
		expect(result!.time).toBeCloseTo(2, 1);
	});
});
