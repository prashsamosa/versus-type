function getRandomElement(arr: string[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}

const languageFile = {
	"English 200": () => import("./wordlist/english.json"),
	"English 1k": () => import("./wordlist/english_1k.json"),
	"English 10k": () => import("./wordlist/english_10k.json"),
};

export type GeneratorConfig = {
	language?: keyof typeof languageFile;
	wordCount?: number;
	punctuation?: boolean;
	numbers?: boolean;
};

export async function generatePassage(
	config: GeneratorConfig = {},
): Promise<string> {
	const punctuations1 = [",", "."];
	const punctuations2 = [".", "?", "!"];

	const {
		wordCount = 50,
		punctuation = true,
		numbers = true,
		language = "English 200",
	} = config;
	const loader = languageFile[language || "English 200"];
	if (!loader) throw new Error(`Unkown language: ${language}`);
	const wordList = (await loader()).default;

	if (wordCount <= 0) return "";

	const generatedWords = [];
	let lastWord = "";

	for (let i = 0; i < wordCount; i++) {
		let word = getRandomElement(wordList);
		if (word === "I" && !punctuation) word = "i";

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

	return generatedWords.join(" ");
}
