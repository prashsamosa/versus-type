"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
	const [words, setWords] = useState(() => generateWords(config));
	const passageChars = words.join(" ");

	const [typedText, setTypedText] = useState("");
	const [scrollOffset, setScrollOffset] = useState(0);
	const hiddenInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const charRefs = useRef<HTMLSpanElement[]>([]);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const lineHeightRef = useRef<number>(0);
	const [focused, setFocused] = useState(false);
	const [finished, setFinished] = useState(false);
	const [cursorPos, setCursorPos] = useState<{
		x: number;
		y: number;
	}>({ x: 0, y: 0 });

	const passageTransforms = useMemo(() => {
		return words.map((word) => word.split("").map(() => getRandomTransform()));
	}, [words]);

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
		// idk why these span.offsetHeight and span.offsetTop gets messed up when i type last char of a word
		// so making em stable
		if (lineHeightRef.current === 0 && span.offsetHeight > 0) {
			lineHeightRef.current = span.offsetHeight;
		}
		const lineHeight = lineHeightRef.current;

		const pt = parseFloat(containerStyle.paddingTop) || 0;
		const pb = parseFloat(containerStyle.paddingBottom) || 0;
		const pl = parseFloat(containerStyle.paddingLeft) || 0;

		const totalHeight =
			span.offsetParent?.scrollHeight ?? container.scrollHeight;
		const visibleHeight = Math.min(totalHeight, lineHeight * 4 + pt + pb);

		container.style.height = `${Math.max(visibleHeight, lineHeight * 4 + pt + pb)}px`;
		const stableOffsetTop =
			Math.round(span.offsetTop / lineHeight) * lineHeight;

		const targetOffset = Math.max(stableOffsetTop - lineHeight, 0);

		if (targetOffset !== scrollOffset) {
			setScrollOffset(targetOffset);
		}

		const raf = requestAnimationFrame(() => {
			const x = pl + span.offsetLeft;
			const y = pt + (stableOffsetTop - targetOffset);
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
			const expected = passageChars[idx];
			recordKey(typed, expected);
		}
		prevInputRef.current = val;

		setTypedText(val);

		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passageChars.length && !finished) {
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	function restartTest() {
		setWords(generateWords(config));
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
				target={passageChars}
				onRestartAction={restartTest}
			/>
		);
	}
	let idx = 0;

	return (
		<div
			ref={containerRef}
			className="max-w-3xl h-32 overflow-hidden mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text"
			onClick={() => {
				hiddenInputRef.current?.focus();
			}}
		>
			<div
				className="absolute bottom-0 left-0 w-full h-16 z-10 select-none"
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
				{words.map((word, w) => {
					const isWordTyped = currentIndex > idx + word.length;
					const isWordCorrect =
						typedText.slice(idx, idx + word.length) === word;
					return (
						<>
							<span
								key={`w-${w}`}
								className={`
									whitespace-nowrap px-1 py-0.5 rounded transition`}
							>
								{word.split("").map((char, c) => {
									const i = idx++;
									const isTyped = i < currentIndex;
									const isCorrect = char === typedText[i];
									let charClassName = "text-foreground";
									if (isTyped) {
										charClassName = isCorrect
											? "text-gray-400"
											: "text-destructive";
									}
									return (
										<span
											key={`c-${w}-${c}`}
											ref={(el) => {
												if (el) charRefs.current[i] = el;
											}}
											className={charClassName}
											style={{
												display: "inline-block",
												transition:
													"transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
												transform:
													isWordTyped && isWordCorrect
														? passageTransforms[w][c]
														: "none",

												willChange: "transform",
											}}
										>
											{char}
										</span>
									);
								})}
							</span>
							{w < words.length - 1
								? // IFFE to capture and increment idx value, because ref callbacks are called later when everything is done
									(() => {
										const i = idx++;
										return (
											<span
												key={`sp-${w}`}
												ref={(el) => {
													if (el) charRefs.current[i] = el;
												}}
												className={
													currentIndex > i
														? typedText[i] === " "
															? "text-gray-400"
															: "bg-destructive/20 rounded"
														: "text-foreground"
												}
											>
												{" "}
											</span>
										);
									})()
								: null}
						</>
					);
				})}
				<span
					ref={(el) => {
						if (el) charRefs.current[passageChars.length] = el;
					}}
					className="inline-block w-px opacity-0"
				></span>
			</div>

			{focused ? (
				<Cursor
					x={cursorPos.x}
					y={cursorPos.y}
					height={charRefs.current[0]?.offsetHeight ?? 0}
				/>
			) : null}
		</div>
	);
}

function getRandomTransform() {
	const x = Math.random() * 10 - 5; // -5px to 5px
	const y = Math.random() * 10 - 5; // -5px to 5px
	const rot = Math.random() * 50 - 25; // -25deg to 25deg
	return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`;
}
