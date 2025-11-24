import { describe, expect, it } from "vitest";
import { generatePassage } from "./passage-generator";

describe("await generateWords", async () => {
	describe("basic generation", async () => {
		it("generates default 50 words", async () => {
			const words = (await generatePassage()).split(" ");
			expect(words).toHaveLength(50);
		});

		it("generates specified word count", async () => {
			const words = (await generatePassage({ wordCount: 20 })).split(" ");
			expect(words).toHaveLength(20);
		});

		it("generates 0 word", async () => {
			const words = (await generatePassage({ wordCount: 0 })).split(" ");
			expect(words[0]).toBe("");
		});

		it("generates -5 words as 0", async () => {
			const words = (await generatePassage({ wordCount: -5 })).split(" ");
			expect(words[0]).toBe("");
		});

		it("generates 200 words", async () => {
			const words = (await generatePassage({ wordCount: 200 })).split(" ");
			expect(words).toHaveLength(200);
		});
	});

	describe("capitalization with punctuation", async () => {
		it("capitalizes first word", async () => {
			const words = (
				await generatePassage({ wordCount: 100, punctuation: true })
			).split(" ");
			const firstWord = words[0] as string;
			const firstChar = firstWord[0];
			expect(firstChar).toBe(firstChar.toUpperCase());
		});

		it("does not capitalize when punctuation is off", async () => {
			const words = (
				await generatePassage({ wordCount: 50, punctuation: false })
			).split(" ");
			const hasCapital = words.some((word) => /^[A-Z]/.test(word as string));
			expect(hasCapital).toBe(false);
		});

		it("generates words without punctuation when disabled", async () => {
			const words = (
				await generatePassage({ wordCount: 50, punctuation: false })
			).split(" ");
			const hasPunctuation = words.some((word) =>
				/[.,?!]/.test(word as string),
			);
			expect(hasPunctuation).toBe(false);
		});
	});

	describe("numbers", async () => {
		it("includes numbers when enabled", async () => {
			const words = (
				await generatePassage({
					wordCount: 100,
					numbers: true,
					punctuation: false,
				})
			).split(" ");
			expect(words.some((word) => /^\d+$/.test(word as string))).toBe(true);
		});

		it("excludes numbers when disabled", async () => {
			const words = (
				await generatePassage({
					wordCount: 50,
					numbers: false,
					punctuation: false,
				})
			).split(" ");
			const hasNumber = words.some((word) => /^\d+$/.test(word as string));
			expect(hasNumber).toBe(false);
		});

		it("generated numbers are within range 0-999", async () => {
			const words = (
				await generatePassage({
					wordCount: 200,
					numbers: true,
					punctuation: false,
				})
			).split(" ");
			words.forEach((word) => {
				if (/^\d+$/.test(word as string)) {
					const num = Number.parseInt(word as string, 10);
					expect(num).toBeGreaterThanOrEqual(0);
					expect(num).toBeLessThan(1000);
				}
			});
		});
	});

	describe("punctuation", async () => {
		it("adds punctuation to some words", async () => {
			const words = (
				await generatePassage({
					wordCount: 100,
					punctuation: true,
					numbers: false,
				})
			).split(" ");
			const hasPunctuation = words.some((word) =>
				/[.,?!]$/.test(word as string),
			);
			expect(hasPunctuation).toBe(true);
		});

		it("does not add punctuation to last word", async () => {
			const words = (
				await generatePassage({ wordCount: 50, punctuation: true })
			).split(" ");
			const lastWord = words[words.length - 1] as string;
			expect(lastWord).not.toMatch(/[.,?!]$/);
		});

		it("uses valid punctuation marks", async () => {
			const words = (
				await generatePassage({
					wordCount: 100,
					punctuation: true,
					numbers: false,
				})
			).split(" ");
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

	describe("config combinations", async () => {
		it("works with all features enabled", async () => {
			const words = (
				await generatePassage({
					wordCount: 50,
					punctuation: true,
					numbers: true,
				})
			).split(" ");

			expect(words).toHaveLength(50);
			const firstWord = words[0] as string;
			expect(firstWord[0]).toBe(firstWord[0].toUpperCase());
		});

		it("works with all features disabled", async () => {
			const words = (
				await generatePassage({
					wordCount: 30,
					punctuation: false,
					numbers: false,
				})
			).split(" ");

			expect(words).toHaveLength(30);
			const hasPunctuation = words.some((word) =>
				/[.,?!]/.test(word as string),
			);
			const hasNumber = words.some((word) => /^\d+$/.test(word as string));

			expect(hasPunctuation).toBe(false);
			expect(hasNumber).toBe(false);
		});

		it("works with empty config object", async () => {
			const words = (await generatePassage({})).split(" ");
			expect(words).toHaveLength(50);
		});
	});
});
