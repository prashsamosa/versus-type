import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isWordCorrect(
	typedText: string,
	word: string,
	startIdx: number,
): boolean {
	const wordEndIdx = startIdx + word.length;
	return typedText.slice(startIdx, wordEndIdx + 1) === word + " ";
}

export function getWordIndex(typedTextLength: number, words: string[]): number {
	let idx = 0;
	for (let i = 0; i < words.length; i++) {
		idx += words[i].length;
		if (typedTextLength <= idx) return i;
		idx++;
	}
	return words.length - 1;
}

export function getWordStartIndex(wordIndex: number, words: string[]): number {
	let idx = 0;
	for (let i = 0; i < wordIndex; i++) {
		idx += words[i].length + 1;
	}
	return idx;
}

export function getOrdinalSuffix(n: number): string {
	const s = ["th", "st", "nd", "rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
