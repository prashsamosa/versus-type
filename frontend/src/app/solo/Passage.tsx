"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { recordKey, resetAccuracy } from "@/lib/accuracy";
import { type GeneratorConfig, generateWords } from "@/lib/passage-generator";
import Cursor from "./Cursor";
import FinishedStats from "./FinishedStats";

const config: GeneratorConfig = {
	wordCount: 30,
	punctuation: true,
	numbers: false,
};

export default function Passage() {
	const [passage, setPassage] = useState(() => generateWords(config).join(" "));
	const characters = passage.split("");

	const [userInput, setUserInput] = useState("");
	const hiddenInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const measureSpansRef = useRef<HTMLSpanElement[]>([]);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const [focused, setFocused] = useState(false);
	const [finished, setFinished] = useState(false);
	const [cursorPos, setCursorPos] = useState<{
		x: number;
		y: number;
		h: number;
	}>({ x: 0, y: 0, h: 0 });

	useEffect(() => {
		hiddenInputRef.current?.focus();
	}, []);

	useLayoutEffect(() => {
		const index = userInput.length;
		const span = measureSpansRef.current[index];
		const container = containerRef.current;
		if (!span || !container) return;
		const sb = span.getBoundingClientRect();
		const cb = container.getBoundingClientRect();
		const cs = getComputedStyle(container);
		const paddingLeft = parseFloat(cs.paddingLeft) || 0;
		const paddingTop = parseFloat(cs.paddingTop) || 0;
		setCursorPos({
			x: sb.left - cb.left - paddingLeft,
			y: sb.top - cb.top - paddingTop,
			h: sb.height,
		});
	}, [userInput]);

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

		setUserInput(val);
		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passage.length && !finished) {
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	function restartTest() {
		setPassage(generateWords(config).join(" "));
		setUserInput("");
		startRef.current = null;
		endRef.current = null;
		prevInputRef.current = "";
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

	const currentIndex = userInput.length;

	if (finished && startRef.current && endRef.current) {
		return (
			<FinishedStats
				startTs={startRef.current}
				endTs={endRef.current}
				input={userInput}
				target={passage}
				onRestartAction={restartTest}
			/>
		);
	}

	return (
		<div
			ref={containerRef}
			className="max-w-3xl mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text"
			onClick={() => {
				hiddenInputRef.current?.focus();
			}}
			style={{ position: "relative" }}
		>
			<input
				ref={hiddenInputRef}
				type="text"
				className="absolute opacity-0 -z-10"
				value={userInput}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={() => {
					setFocused(true);
				}}
				onBlur={() => {
					setFocused(false);
				}}
			/>
			<div className="relative text-2xl leading-relaxed font-mono select-none">
				{characters.map((char, index) => {
					const isTyped = index < currentIndex;
					const isCorrect = char === userInput[index];
					let charClassName = "text-foreground";
					if (isTyped) {
						charClassName = isCorrect ? "text-gray-400" : "text-destructive";
					}
					return (
						<span
							key={index}
							ref={(el) => {
								if (el) measureSpansRef.current[index] = el;
							}}
							className={charClassName}
						>
							{char || " "}
						</span>
					);
				})}
				<span
					ref={(el) => {
						if (el) measureSpansRef.current[characters.length] = el;
					}}
					className="inline-block w-px opacity-0"
				></span>
				{focused ? (
					<Cursor x={cursorPos.x} y={cursorPos.y} height={cursorPos.h} />
				) : null}
			</div>
		</div>
	);
}
