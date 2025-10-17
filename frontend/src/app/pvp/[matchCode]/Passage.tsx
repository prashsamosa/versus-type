"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorPosition } from "@/app/hooks/useCursorPosition";
import Cursor from "./Cursor";
import { usePvpTypingState } from "./hooks/usePvpTypingState";
import PassageDisplay from "./PassageDisplay";

export default function Passage({
	words,
	disabled,
}: {
	words: string[];
	disabled?: boolean;
}) {
	const { typedText, finished, startRef, endRef, handleInputChange } =
		usePvpTypingState(words);

	const { scrollOffset, cursorPos, containerRef, charRefs } = useCursorPosition(
		typedText.length,
	);
	const [focused, setFocused] = useState(false);

	const hiddenInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!disabled) hiddenInputRef.current?.focus();
	}, [disabled]);

	if (finished && startRef.current && endRef.current) {
		return <p>finished lol</p>;
	}

	return (
		<div
			ref={containerRef}
			className="max-w-3xl min-h-48 border overflow-hidden mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text"
			onClick={() => {
				hiddenInputRef.current?.focus();
			}}
		>
			<div
				className="absolute bottom-0 left-0 w-full h-14 z-10 select-none"
				style={{
					background: "linear-gradient(to bottom, transparent, var(--card))",
				}}
			/>
			<input
				ref={hiddenInputRef}
				type="text"
				className="absolute opacity-0 -z-10"
				value={typedText}
				onChange={handleInputChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>

			<PassageDisplay
				words={words}
				typedText={typedText}
				charRefs={charRefs}
				scrollOffset={scrollOffset}
			/>

			{focused && !disabled ? (
				<Cursor
					x={cursorPos.x}
					y={cursorPos.y}
					height={charRefs.current?.[0]?.offsetHeight ?? 0}
				/>
			) : null}
		</div>
	);
}
