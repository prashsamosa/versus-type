import {
	type GeneratorConfig,
	generatePassage,
} from "@versus-type/shared/passage-generator";
import Passage from "./Passage";

const config: GeneratorConfig = {
	wordCount: 15,
	punctuation: true,
	numbers: false,
};

export default async function SoloPage() {
	const words = (await generatePassage(config)).split(" ");

	return (
		<div className="bg-background flex items-center justify-center min-h-screen py-2">
			<Passage initialWords={words} config={config} />
		</div>
	);
}
