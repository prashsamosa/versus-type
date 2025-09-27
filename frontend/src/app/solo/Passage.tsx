"use client";

import { useEffect, useRef, useState } from "react";
import type { GeneratorConfig } from "@/lib/passage-generator";
import Cursor from "./Cursor";
import FinishedStats from "./FinishedStats";
import { useCursorPosition } from "./hooks/useCursorPosition";
import { useTypingTest } from "./hooks/useTypingTest";
import PassageDisplay from "./PassageDisplay";

export default function Passage({
	initialWords,
	config,
}: {
	initialWords: string[];
	config: GeneratorConfig;
}) {
	const {
		words,
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		handleInputChange,
		restartTest,
		handleKeyDown,
	} = useTypingTest(config, initialWords);

	const { scrollOffset, cursorPos, containerRef, charRefs } =
		useCursorPosition(typedText);
	const [focused, setFocused] = useState(false);

	const hiddenInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		hiddenInputRef.current?.focus();
	}, []);

	function handleRestart() {
		restartTest();
		if (charRefs.current) charRefs.current.length = 0;
		setFocused(false);
		setTimeout(() => {
			hiddenInputRef.current?.focus();
		}, 0);
	}

	if (finished && startRef.current && endRef.current) {
		return (
			<FinishedStats
				startTs={startRef.current}
				endTs={endRef.current}
				input={typedText}
				target={passageChars}
				onRestartAction={handleRestart}
			/>
		);
	}

	return (
		<div
			ref={containerRef}
			className="max-w-3xl h-32 overflow-hidden mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text"
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
				onKeyDown={handleKeyDown}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>

			<PassageDisplay
				words={words}
				typedText={typedText}
				charRefs={charRefs}
				scrollOffset={scrollOffset}
			/>

			{focused ? (
				<Cursor
					x={cursorPos.x}
					y={cursorPos.y}
					height={charRefs.current?.[0]?.offsetHeight ?? 0}
				/>
			) : null}
		</div>
	);
}
