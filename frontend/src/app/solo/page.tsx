"use client";

import { type GeneratorConfig, generateWords } from "@/lib/passage-generator";

const config: GeneratorConfig = {
	wordCount: 100,
	punctuation: true,
	numbers: false,
};
export default function SoloPage() {
	return (
		<div className="bg-background items-center justify-center min-h-screen py-2">
			<Passage />
		</div>
	);
}

function Passage() {
	const words = generateWords(config);
	return (
		<div className="max-w-3xl mx-auto mt-20 p-4 flex flex-wrap bg-card rounded-md">
			{words.map((word, index) => (
				<span key={index} className="text-2xl m-1 text-foreground">
					{word}
				</span>
			))}
		</div>
	);
}
