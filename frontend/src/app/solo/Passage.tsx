"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { recordKey, resetAccuracy } from "@/lib/accuracy";
import { type GeneratorConfig, generateWords } from "@/lib/passage-generator";
import Cursor from "./Cursor";
import FinishedStats from "./FinishedStats";

const config: GeneratorConfig = {
	wordCount: 90,
	punctuation: true,
	numbers: false,
};

export default function Passage() {
	const [passage, setPassage] = useState(() => generateWords(config).join(" "));
	const characters = passage.split("");

	const [typedText, setTypedText] = useState("");
	const [scrollOffset, setScrollOffset] = useState(0);
	const hiddenInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const charRefs = useRef<HTMLSpanElement[]>([]);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const [focused, setFocused] = useState(false);
	const [finished, setFinished] = useState(false);
	const [cursorPos, setCursorPos] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	useEffect(() => {
		hiddenInputRef.current?.focus();
	}, []);

	// every time I touch this code, plumbing school looks real nice
	useLayoutEffect(() => {
		const index = typedText.length;
		const span = charRefs.current[index];
		const container = containerRef.current;
		if (!span || !container) return;

		const containerStyle = getComputedStyle(container);
		const lineHeight = span.offsetHeight;
		const pt = parseFloat(containerStyle.paddingTop) || 0;
		const pb = parseFloat(containerStyle.paddingBottom) || 0;
		const pl = parseFloat(containerStyle.paddingLeft) || 0;

		const totalHeight =
			span.offsetParent?.scrollHeight ?? container.scrollHeight;
		const visibleHeight = Math.min(totalHeight, lineHeight * 3 + pt + pb);
		container.style.height = `${visibleHeight}px`;

		const targetOffset = Math.max(span.offsetTop - lineHeight, 0);

		if (targetOffset !== scrollOffset) {
			setScrollOffset(targetOffset);
		}

		const raf = requestAnimationFrame(() => {
			const x = pl + span.offsetLeft;
			const y = pt + (span.offsetTop - targetOffset);
			setCursorPos({ x, y });
		});

		return () => cancelAnimationFrame(raf);
	}, [typedText]);
	// }, [userInput, scrollOffset]);

	const prevInputRef = useRef("");

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const val = e.target.value;

		const prev = prevInputRef.current;
		const idx = prev.length;
		if (val.length === prev.length + 1 && val.startsWith(prev)) {
			const typed = val[idx];
			const expected = passage[idx];
			recordKey(typed, expected);
		}
		prevInputRef.current = val;

		setTypedText(val);
		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passage.length && !finished) {
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	function restartTest() {
		setPassage(generateWords(config).join(" "));
		setTypedText("");
		startRef.current = null;
		endRef.current = null;
		charRefs.current = [];
		prevInputRef.current = "";
		scrollOffset && setScrollOffset(0);
		resetAccuracy();
		setFinished(false);
		hiddenInputRef.current?.focus();
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Tab") {
			e.preventDefault();
			restartTest();
		}
	}

	const currentIndex = typedText.length;

	if (finished && startRef.current && endRef.current) {
		return (
			<FinishedStats
				startTs={startRef.current}
				endTs={endRef.current}
				input={typedText}
				target={passage}
				onRestartAction={restartTest}
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
			style={{ position: "relative" }}
		>
			<input
				ref={hiddenInputRef}
				type="text"
				className="absolute opacity-0 -z-10"
				value={typedText}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={() => {
					setFocused(true);
				}}
				onBlur={() => {
					setFocused(false);
				}}
			/>
			<div
				className="relative text-2xl leading-relaxed font-mono select-none"
				style={{
					transform: `translateY(-${scrollOffset}px)`,
					transition: "transform 0.1s ease-out",
				}}
			>
				{characters.map((char, index) => {
					const isTyped = index < currentIndex;
					const isCorrect = char === typedText[index];
					let charClassName = "text-foreground";
					if (isTyped) {
						charClassName = isCorrect ? "text-gray-400" : "text-destructive";
					}
					return (
						<span
							key={index}
							ref={(el) => {
								if (el) charRefs.current[index] = el;
							}}
							className={charClassName}
						>
							{char || " "}
						</span>
					);
				})}
				<span
					ref={(el) => {
						if (el) charRefs.current[characters.length] = el;
					}}
					className="inline-block w-px opacity-0"
				></span>
			</div>

			{focused ? (
				<Cursor
					x={cursorPos.x}
					y={cursorPos.y}
					height={charRefs.current[0].offsetHeight ?? 0}
				/>
			) : null}
		</div>
	);
}
