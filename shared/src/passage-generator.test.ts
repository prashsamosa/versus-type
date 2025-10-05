import { describe, expect, it } from "vitest";
import { generateWords } from "./passage-generator";

describe("generateWords", () => {
	describe("basic generation", () => {
		it("generates default 50 words", () => {
			const words = generateWords();
			expect(words).toHaveLength(50);
		});

		it("generates specified word count", () => {
			const words = generateWords({ wordCount: 20 });
			expect(words).toHaveLength(20);
		});

		it("generates 0 word", () => {
			const words = generateWords({ wordCount: 0 });
			expect(words).toHaveLength(0);
		});

		it("generates -5 words as 0", () => {
			const words = generateWords({ wordCount: -5 });
			expect(words).toHaveLength(0);
		});

		it("generates 200 words", () => {
			const words = generateWords({ wordCount: 200 });
			expect(words).toHaveLength(200);
		});
	});

	describe("capitalization with punctuation", () => {
		it("capitalizes first word", () => {
			const words = generateWords({ wordCount: 100, punctuation: true });
			const firstWord = words[0] as string;
			const firstChar = firstWord[0];
			expect(firstChar).toBe(firstChar.toUpperCase());
		});

		it("does not capitalize when punctuation is off", () => {
			const words = generateWords({ wordCount: 50, punctuation: false });
			const hasCapital = words.some((word) => /^[A-Z]/.test(word as string));
			expect(hasCapital).toBe(false);
		});

		it("generates words without punctuation when disabled", () => {
			const words = generateWords({ wordCount: 50, punctuation: false });
			const hasPunctuation = words.some((word) =>
				/[.,?!]/.test(word as string),
			);
			expect(hasPunctuation).toBe(false);
		});
	});

	describe("numbers", () => {
		it("includes numbers when enabled", () => {
			const words = generateWords({
				wordCount: 100,
				numbers: true,
				punctuation: false,
			});
			expect(words.some((word) => /^\d+$/.test(word as string))).toBe(true);
		});

		it("excludes numbers when disabled", () => {
			const words = generateWords({
				wordCount: 50,
				numbers: false,
				punctuation: false,
			});
			const hasNumber = words.some((word) => /^\d+$/.test(word as string));
			expect(hasNumber).toBe(false);
		});

		it("generated numbers are within range 0-999", () => {
			const words = generateWords({
				wordCount: 200,
				numbers: true,
				punctuation: false,
			});
			words.forEach((word) => {
				if (/^\d+$/.test(word as string)) {
					const num = Number.parseInt(word as string, 10);
					expect(num).toBeGreaterThanOrEqual(0);
					expect(num).toBeLessThan(1000);
				}
			});
		});
	});

	describe("punctuation", () => {
		it("adds punctuation to some words", () => {
			const words = generateWords({
				wordCount: 100,
				punctuation: true,
				numbers: false,
			});
			const hasPunctuation = words.some((word) =>
				/[.,?!]$/.test(word as string),
			);
			expect(hasPunctuation).toBe(true);
		});

		it("does not add punctuation to last word", () => {
			const words = generateWords({ wordCount: 50, punctuation: true });
			const lastWord = words[words.length - 1] as string;
			expect(lastWord).not.toMatch(/[.,?!]$/);
		});

		it("uses valid punctuation marks", () => {
			const words = generateWords({
				wordCount: 100,
				punctuation: true,
				numbers: false,
			});
			const punctuatedWords = words.filter((word) =>
				/[.,?!]$/.test(word as string),
			);
			punctuatedWords.forEach((word) => {
				const w = word as string;
				const lastChar = w.slice(-1);
				expect([",", ".", "?", "!"]).toContain(lastChar);
			});
		});
	});

	describe("config combinations", () => {
		it("works with all features enabled", () => {
			const words = generateWords({
				wordCount: 50,
				punctuation: true,
				numbers: true,
			});

			expect(words).toHaveLength(50);
			const firstWord = words[0] as string;
			expect(firstWord[0]).toBe(firstWord[0].toUpperCase());
		});

		it("works with all features disabled", () => {
			const words = generateWords({
				wordCount: 30,
				punctuation: false,
				numbers: false,
			});

			expect(words).toHaveLength(30);
			const hasPunctuation = words.some((word) =>
				/[.,?!]/.test(word as string),
			);
			const hasNumber = words.some((word) => /^\d+$/.test(word as string));

			expect(hasPunctuation).toBe(false);
			expect(hasNumber).toBe(false);
		});

		it("works with empty config object", () => {
			const words = generateWords({});
			expect(words).toHaveLength(50);
		});
	});
});
