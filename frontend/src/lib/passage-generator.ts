import english from "../wordlist/english.json";

const wordList = english.words;
const punctuations1 = [",", "."];
const punctuations2 = [".", "?", "!"];

function getRandomElement(arr: string[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

type Config = {
	wordCount?: number;
	punctuation?: boolean;
	numbers?: boolean;
};

export function generateWords(config: Config = {}) {
	const { wordCount = 50, punctuation = true, numbers = true } = config;

	const generatedWords = [];
	let lastWord = "";

	for (let i = 0; i < wordCount; i++) {
		let word = getRandomElement(wordList);

		// capitalize the first word or words after a period/question mark/exclamation point
		if (punctuation && (i === 0 || /[.?!]/.test(lastWord.slice(-1)))) {
			word = word.charAt(0).toUpperCase() + word.slice(1);
		}

		if (numbers && Math.random() < 0.1) {
			generatedWords.push(Math.floor(Math.random() * 1000).toString());
			lastWord = generatedWords[generatedWords.length - 1];
			continue;
		}

		if (punctuation && Math.random() < 0.2 && i < wordCount - 1) {
			if (Math.random() < 0.8) {
				word += getRandomElement(punctuations1);
			} else {
				word += getRandomElement(punctuations2);
			}
		}

		generatedWords.push(word);
		lastWord = word;
	}

	return generatedWords;
}
