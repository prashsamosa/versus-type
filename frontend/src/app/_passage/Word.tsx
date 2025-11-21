"use client";

interface WordProps {
	word: string;
	wordIndex: number;
	startIndex: number;
	currentIndex: number;
	typedText: string;
	charRefs: React.RefObject<HTMLSpanElement[]>;
	shouldShake?: boolean;
}

export default function Word({
	word,
	wordIndex,
	startIndex,
	currentIndex,
	typedText,
	charRefs,
	shouldShake = false,
}: WordProps) {
	let idx = startIndex;

	// const isWordTyped = currentIndex > idx + word.length;
	// const isWordCorrect = typedText.slice(idx, idx + word.length) === word;
	const isWordPartiallyCorrect =
		typedText.slice(idx, idx + word.length) ===
		word.slice(0, currentIndex - idx);
	const isWordCurrentOrPrev = currentIndex >= idx;
	return (
		<span
			// WARNING: DO NOT ADD 'relative' HERE. IT BREAKS THE WHOLE CURSOR POSITIONING SYSTEM(fucks up char's span's offsetLeft)
			// spend hours debugging T_T
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
							animation: shouldShake ? "shake 0.4s ease-in-out" : "none",
							// 	: isWordTyped && isWordCorrect
							// 		? // ? passageTransforms[wordIndex][charIndex]
							// 			"charBounce 0.3s"
							// 		: "none",
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
