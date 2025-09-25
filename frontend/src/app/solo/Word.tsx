"use client";

interface WordProps {
	word: string;
	wordIndex: number;
	startIndex: number;
	currentIndex: number;
	typedText: string;
	charRefs: React.RefObject<HTMLSpanElement[]>;
	burstEffect: boolean;
	// passageTransforms: string[][];
}

export default function Word({
	word,
	wordIndex,
	startIndex,
	currentIndex,
	typedText,
	charRefs,
	burstEffect,
	// passageTransforms,
}: WordProps) {
	let idx = startIndex;

	const isWordTyped = currentIndex > idx + word.length;
	const isWordCorrect = typedText.slice(idx, idx + word.length) === word;
	const isWordPartiallyCorrect =
		typedText.slice(idx, idx + word.length) ===
		word.slice(0, currentIndex - idx);
	const isWordCurrentOrPrev = currentIndex >= idx;

	return (
		<span
			className={`whitespace-nowrap rounded transition ${
				isWordCurrentOrPrev && !isWordPartiallyCorrect
					? "underline underline-offset-2 decoration-destructive"
					: ""
			}`}
		>
			{word.split("").map((char, charIndex) => {
				const i = idx++;
				const isTyped = i < currentIndex;
				const isCorrect = char === typedText[i];

				let charClassName = "text-foreground ";
				if (isTyped) {
					charClassName = isCorrect ? "text-gray-400" : "text-destructive";
				}
				charClassName +=
					isWordCurrentOrPrev && !isWordPartiallyCorrect
						? " underline underline-offset-4 decoration-destructive"
						: "";

				return (
					<span
						key={`c-${wordIndex}-${charIndex}`}
						ref={(el) => {
							if (el) charRefs.current[i] = el;
						}}
						className={charClassName}
						style={{
							display: "inline-block",
							transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
							transform:
								burstEffect && isWordTyped && isWordCorrect
									? // ? passageTransforms[wordIndex][charIndex]
										"translateX(-5px)"
									: "none",
							willChange: "transform",
						}}
					>
						{char}
					</span>
				);
			})}
		</span>
	);
}
