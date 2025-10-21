"use client";

import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { useEffect, useRef, useState } from "react";
import Cursor from "@/app/_passage/Cursor";
import { useCursorPosition } from "@/app/_passage/hooks/useCursorPosition";
import PassageText from "@/app/_passage/PassageText";
import FinishedStats from "./FinishedStats";
import { useTypingTest } from "./hooks/useTypingTest";

export default function Passage({
	initialWords,
	config,
}: {
	initialWords: string[];
	config: GeneratorConfig;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const charRefs = useRef<HTMLSpanElement[]>([]);

	const {
		words,
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		accuracyRef,
		handleInputChange,
		restartTest,
		handleKeyDown,
	} = useTypingTest(config, initialWords);

	const { scrollOffset, cursorPos } = useCursorPosition(
		typedText.length,
		containerRef,
		charRefs,
	);
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
				accuracyState={accuracyRef.current}
			/>
		);
	}

	return (
		<div
			ref={containerRef}
			className="max-w-3xl h-64 overflow-hidden mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text"
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
			<PassageText
				words={words}
				typedText={typedText}
				charRefs={charRefs}
				scrollOffset={scrollOffset}
			/>
			<Cursor x={cursorPos.x} y={cursorPos.y} disabled={!focused} />
		</div>
	);
}
