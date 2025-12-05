"use client";

import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { useEffect, useRef, useState } from "react";
import Cursor from "@/app/_passage/Cursor";
import { useCursorPosition } from "@/app/_passage/hooks/useCursorPosition";
import PassageText from "@/app/_passage/PassageText";
import { StreakDisplay } from "@/components/ui/streak-display";
import FinishedStats from "./FinishedStats";
import { useTypingState } from "./hooks/useTypingState";
import { PassageConfigPanel } from "./PassageConfigPanel";

export default function Passage({
	words,
	config,
	onConfigChange,
}: {
	words: string[];
	config: GeneratorConfig;
	onConfigChange: (config: GeneratorConfig) => void;
}) {
	const containerRef = useRef<HTMLDivElement>(null);
	const charRefs = useRef<HTMLSpanElement[]>([]);

	const {
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		accuracyRef,
		handleInputChange,
		handleKeyDown,
		incorrect,
		streak,
		maxStreak,
	} = useTypingState(words);

	const [manualScrollOffset, setManualScrollOffset] = useState<number | null>(
		null,
	);

	const { scrollOffset, cursorPos } = useCursorPosition(
		typedText.length,
		containerRef,
		charRefs,
		manualScrollOffset,
	);
	const [focused, setFocused] = useState(false);

	const hiddenInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		hiddenInputRef.current?.focus();
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		function handleWheel(e: WheelEvent) {
			e.preventDefault();
			setManualScrollOffset((prev) => {
				prev = prev === null ? scrollOffset : prev;
				const maxScrollOffset = Math.max(
					0,
					(container?.scrollHeight ?? 0) - (container?.clientHeight ?? 0),
				);
				return Math.min(Math.max(0, prev + e.deltaY * 0.2), maxScrollOffset);
			});
		}

		container.addEventListener("wheel", handleWheel, { passive: false });
		return () => container.removeEventListener("wheel", handleWheel);
	}, [scrollOffset]);

	function handleRestart(fromFinishScreen: boolean = false) {
		onConfigChange(config);
		if (charRefs.current) charRefs.current.length = 0;
		if (fromFinishScreen) setFocused(false);
		setManualScrollOffset(null);
		setTimeout(() => {
			hiddenInputRef.current?.focus();
		}, 5);
	}

	if (finished && startRef.current && endRef.current) {
		return (
			<FinishedStats
				startTs={startRef.current}
				endTs={endRef.current}
				input={typedText}
				target={passageChars}
				maxStreak={maxStreak}
				onRestartAction={() => handleRestart(true)}
				accuracyState={accuracyRef.current}
				passageConfig={config}
			/>
		);
	}
	const finalScrollOffset =
		manualScrollOffset === null ? scrollOffset : manualScrollOffset;

	return (
		<div className="relative -mt-10">
			<div className="absolute -top-10 left-0 z-20 flex justify-between items-center w-full pl-2">
				<PassageConfigPanel
					config={config}
					onConfigChange={(config) => {
						onConfigChange(config);
						setTimeout(() => hiddenInputRef.current?.focus(), 50);
					}}
					disabled={startRef.current !== null}
				/>
				<StreakDisplay streak={streak} />
			</div>
			<div
				ref={containerRef}
				className="max-w-3xl min-h-[13rem] overflow-hidden mx-auto transition px-4 pt-2 pb-10 bg-card/50 rounded-md relative cursor-text"
				onClick={() => {
					hiddenInputRef.current?.focus();
				}}
			>
				<div
					className={
						"absolute top-0 left-0 w-full h-14 z-10 select-none transition " +
						(finalScrollOffset ? "opacity-100" : "opacity-0")
					}
					style={{
						background: `
      linear-gradient(
        to bottom,
        var(--background) 20%,
        rgba(var(--background-rgb), 0.9) 30%,
        rgba(var(--background-rgb), 0.6) 45%,
        rgba(var(--background-rgb), 0.3) 70%,
        rgba(var(--background-rgb), 0.1) 60%,
        transparent 100%
      )
    `,
					}}
				/>
				<div
					className="absolute bottom-0 left-0 w-full h-14 z-10 select-none"
					style={{
						background: `
      linear-gradient(
        to top,
        var(--background) 20%,
        rgba(var(--background-rgb), 0.9) 30%,
        rgba(var(--background-rgb), 0.6) 45%,
        rgba(var(--background-rgb), 0.3) 70%,
        rgba(var(--background-rgb), 0.1) 60%,
        transparent 100%
      )
    `,
					}}
				/>
				<input
					ref={hiddenInputRef}
					type="text"
					className="absolute opacity-0 -z-10"
					value={typedText}
					onChange={(e) => {
						setManualScrollOffset(null);
						handleInputChange(e);
					}}
					onKeyDown={(e) => handleKeyDown(e, handleRestart)}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
				/>
				<PassageText
					words={words}
					typedText={typedText}
					charRefs={charRefs}
					scrollOffset={finalScrollOffset}
				/>
				<Cursor
					x={cursorPos.x}
					y={cursorPos.y}
					disabled={!focused}
					redGlow={incorrect}
				/>
			</div>
		</div>
	);
}
