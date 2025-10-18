"use client";

import type { PlayersInfo } from "@versus-type/shared/index";
import { useEffect, useRef, useState } from "react";
import Cursor from "@/app/_passage/Cursor";
import { useCursorPosition } from "@/app/_passage/hooks/useCursorPosition";
import PassageText from "@/app/_passage/PassageText";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import { useOppCursorPositions } from "./hooks/useOppCursorPositions";
import { usePvpTypingState } from "./hooks/usePvpTypingState";

export default function Passage({
	words,
	disabled,
	players,
}: {
	words: string[];
	disabled?: boolean;
	players: PlayersInfo;
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
	const [oppIndexes, setOppIndexes] = useState<Record<string, number>>({});
	const { oppCursorPoses } = useOppCursorPositions(
		oppIndexes,
		containerRef,
		charRefs,
		scrollOffset,
		manualScrollOffset,
	);
	const userId = authClient.useSession()?.data?.user?.id;
	const color = players[userId || ""]?.color || "black";

	const hiddenInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (!disabled) {
			hiddenInputRef.current?.focus();
			setManualScrollOffset(null);
		}
	}, [disabled]);

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

	if (finished && startRef.current && endRef.current) {
		return <p>finished lol</p>;
	}

	return (
		<div
			ref={containerRef}
			className={
				"max-w-3xl min-h-[13rem] overflow-hidden mx-auto mt-20 px-4 py-10 bg-card/50 rounded-md relative cursor-text " +
				(disabled ? "opacity-80" : "")
			}
			onClick={() => {
				hiddenInputRef.current?.focus();
			}}
		>
			<div
				className="absolute top-0 left-0 w-full h-14 z-10 select-none"
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
				onChange={
					disabled
						? () => {}
						: (e) => {
								setManualScrollOffset(null);
								handleInputChange(e);
							}
				}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
			/>

			<PassageText
				words={words}
				typedText={typedText}
				charRefs={charRefs}
				scrollOffset={
					manualScrollOffset === null ? scrollOffset : manualScrollOffset
				}
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
								color={players[oppId]?.color || "gray"}
							/>
						);
					})
				: null}
		</div>
	);
}
