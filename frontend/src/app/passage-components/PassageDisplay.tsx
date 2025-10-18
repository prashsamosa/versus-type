"use client";

import Word from "./Word";

interface PassageDisplayProps {
	words: string[];
	typedText: string;
	charRefs: React.RefObject<HTMLSpanElement[]>;
	scrollOffset: number;
}

interface SpaceProps {
	spaceIndex: number;
	currentIndex: number;
	typedText: string;
	charRefs: React.RefObject<HTMLSpanElement[]>;
	wordIndex: number;
}

function Space({
	spaceIndex,
	currentIndex,
	typedText,
	charRefs,
	wordIndex,
}: SpaceProps) {
	return (
		<span
			key={`sp-${wordIndex}`}
			ref={(el) => {
				if (el && charRefs.current) charRefs.current[spaceIndex] = el;
			}}
			className={
				currentIndex > spaceIndex
					? typedText[spaceIndex] === " "
						? "text-gray-400"
						: "bg-destructive/20 rounded"
					: "text-foreground"
			}
		>
			{" "}
		</span>
	);
}

// was testing funky ass effects for correct words
// function getRandomTransform() {
// 	const x = Math.random() * 6 - 3;
// 	const y = Math.random() * 6 - 3;
// 	const rot = Math.random() * 30 - 15;
// 	return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
// }

export default function PassageDisplay({
	words,
	typedText,
	charRefs,
	scrollOffset,
}: PassageDisplayProps) {
	const currentIndex = typedText.length;

	// const passageTransforms = useMemo(() => {
	// 	return words.map((word) => word.split("").map(() => getTransform()));
	// }, [words]);

	let idx = 0;
	return (
		<div
			className="relative text-2xl leading-relaxed font-mono select-none"
			style={{
				transform: `translateY(-${scrollOffset}px)`,
				transition: "transform 0.1s ease-out",
			}}
		>
			{words.map((word, wordIndex) => {
				const wordStartIndex = idx;
				idx += word.length;

				return (
					<div key={`word-container-${wordIndex}`} className="inline">
						<Word
							key={`w-${wordIndex}`}
							word={word}
							wordIndex={wordIndex}
							startIndex={wordStartIndex}
							currentIndex={currentIndex}
							typedText={typedText}
							charRefs={charRefs}
							// passageTransforms={passageTransforms}
						/>
						{wordIndex < words.length - 1 ? (
							<Space
								spaceIndex={idx++}
								currentIndex={currentIndex}
								typedText={typedText}
								charRefs={charRefs}
								wordIndex={wordIndex}
							/>
						) : null}
					</div>
				);
			})}
			<span
				ref={(el) => {
					if (el && charRefs.current)
						charRefs.current[words.join(" ").length] = el;
				}}
				className="inline-block w-px opacity-0"
			/>
		</div>
	);
}
