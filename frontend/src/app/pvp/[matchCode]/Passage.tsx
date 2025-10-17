"use client";

import { useEffect, useRef, useState } from "react";
import { useCursorPosition } from "@/app/hooks/useCursorPosition";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Cursor from "./Cursor";
import { useOppCursorPositions } from "./hooks/useOppCursorPositions";
import { usePvpTypingState } from "./hooks/usePvpTypingState";
import PassageDisplay from "./PassageDisplay";

export default function Passage({
	words,
	disabled,
	playerColors,
}: {
	words: string[];
	disabled?: boolean;
	playerColors: Record<string, string>;
}) {
	useEffect(() => {
		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:progress-update": (data) => {
				setOppIndexes((prev) => ({ ...prev, [data.userId]: data.typingIndex }));
			},
		});
		return unregister;
	}, [socket]);
	const containerRef = useRef<HTMLDivElement>(null);
	const charRefs = useRef<HTMLSpanElement[]>([]);

	const { typedText, finished, startRef, endRef, handleInputChange } =
		usePvpTypingState(words);

	const { scrollOffset, cursorPos } = useCursorPosition(
		typedText.length,
		containerRef,
		charRefs,
	);
	const [focused, setFocused] = useState(false);
	const [oppIndexes, setOppIndexes] = useState<Record<string, number>>({});
	const { oppCursorPoses } = useOppCursorPositions(
		oppIndexes,
		containerRef,
		charRefs,
		scrollOffset,
	);
	const userId = authClient.useSession()?.data?.user?.id;
	const color = playerColors[userId || ""] || "grey";

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
			className={
				"max-w-3xl min-h-48 border overflow-hidden mx-auto mt-20 p-4 bg-card rounded-md relative cursor-text " +
				(disabled ? "opacity-80" : "")
			}
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
				onChange={disabled ? () => {} : handleInputChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>

			<PassageDisplay
				words={words}
				typedText={typedText}
				charRefs={charRefs}
				scrollOffset={scrollOffset}
			/>

			{!disabled ? (
				<Cursor
					x={cursorPos.x}
					y={cursorPos.y}
					color={color}
					disabled={!focused}
				/>
			) : null}
			{!disabled
				? Object.entries(oppCursorPoses).map(([oppId, pos]) => {
						if (oppId === userId) return null;
						return (
							<Cursor
								key={oppId}
								x={pos.x}
								y={pos.y}
								color={playerColors[oppId] || "grey"}
							/>
						);
					})
				: null}
		</div>
	);
}
