"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { type GeneratorConfig, generateWords } from "@/lib/passage-generator";
import { cn } from "@/lib/utils";

const config: GeneratorConfig = {
	wordCount: 30,
	punctuation: true,
	numbers: false,
};

export default function SoloPage() {
	return (
		<div className="bg-background flex items-center justify-center min-h-screen py-2">
			<Passage />
		</div>
	);
}

function Cursor({ x, y, height }: { x: number; y: number; height: number }) {
	return (
		<span
			aria-hidden
			className={cn(
				"pointer-events-none absolute left-0 top-0 w-0.5 rounded bg-primary will-change-transform",
				"transition-transform duration-100 ease-out",
			)}
			style={{ transform: `translate3d(${x}px, ${y}px, 0)`, height }}
		/>
	);
}

function Passage() {
	const [passage, setPassage] = useState(() => generateWords(config).join(" "));
	const characters = passage.split("");

	const [userInput, setUserInput] = useState("");
	const hiddenInputRef = useRef<HTMLInputElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const measureSpansRef = useRef<HTMLSpanElement[]>([]);
	const [focused, setFocused] = useState(false);
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
		// const lineHeight = parseFloat(cs.lineHeight) || sb.height;
		// const dy = (lineHeight - sb.height) / 2;
		setCursorPos({
			x: sb.left - cb.left - paddingLeft,
			y: sb.top - cb.top - paddingTop,
			h: sb.height,
		});
	}, [userInput]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setUserInput(e.target.value);
	};

	const restartTest = () => {
		setPassage(generateWords(config).join(" "));
		setUserInput("");
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Tab") {
			e.preventDefault();
			restartTest();
		}
	};

	const currentIndex = userInput.length;

	return (
		<div
			ref={containerRef}
			className="max-w-3xl mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text"
			onClick={() => hiddenInputRef.current?.focus()}
			style={{ position: "relative" }}
		>
			<input
				ref={hiddenInputRef}
				type="text"
				className="absolute opacity-0 -z-10"
				value={userInput}
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>
			{/* characters layer */}
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
					// sentinel to measure end position
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
