import { type GeneratorConfig, generateWords } from "@/lib/passage-generator";
import Passage from "./Passage";

const config: GeneratorConfig = {
	wordCount: 15,
	punctuation: true,
	numbers: false,
};

export default function SoloPage() {
	const words = generateWords(config);

	return (
		<div className="bg-background flex items-center justify-center min-h-screen py-2">
			<Passage burstEffect={true} initialWords={words} config={config} />
		</div>
	);
}
