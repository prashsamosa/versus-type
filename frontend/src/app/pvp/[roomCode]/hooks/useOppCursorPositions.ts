"use client";

import { useLayoutEffect, useRef, useState } from "react";

type CursorData = {
	x: number;
	y: number;
};

export function useOppCursorPositions(
	typingIndexes: Record<string, number>,
	containerRef: React.RefObject<HTMLDivElement | null>,
	charRefs: React.RefObject<HTMLSpanElement[]>,
	scrollOffset: number,
	manualScrollOffset: number | null = null,
	enabled = true,
) {
	const [oppCursorPoses, setOppCursorPoses] = useState<
		Record<string, CursorData>
	>({});

	// single cached lineHeight, reset on resize
	const lineHeightRef = useRef<number>(0);

	useLayoutEffect(() => {
		if (!enabled) {
			setOppCursorPoses({});
			return;
		}

		const cleanups: (() => void)[] = [];

		const activeOffset =
			manualScrollOffset === null ? scrollOffset : manualScrollOffset;

		// calculate lineHeight from actual line spacing (first char vs second line char)
		// NOT from span.offsetHeight which differs from line spacing
		const firstChar = charRefs.current?.[0];
		if (lineHeightRef.current === 0 && firstChar) {
			for (const typingPos of Object.values(typingIndexes)) {
				const span = charRefs.current?.[typingPos];
				if (!span || span === firstChar) continue;
				const diff = span.offsetTop - firstChar.offsetTop;
				if (diff > 10) {
					lineHeightRef.current = diff;
					break;
				}
			}
		}

		for (const [userId, typingPos] of Object.entries(typingIndexes)) {
			const span = charRefs.current?.[typingPos];
			const container = containerRef.current;
			if (!span || !container) continue;

			const containerStyle = getComputedStyle(container);

			const lineHeight = lineHeightRef.current || span.offsetHeight;

			const pt = parseFloat(containerStyle.paddingTop) || 0;
			const pb = parseFloat(containerStyle.paddingBottom) || 0;
			const pl = parseFloat(containerStyle.paddingLeft) || 0;

			const totalHeight =
				span.offsetParent?.scrollHeight ?? container.scrollHeight;
			const visibleHeight = Math.min(totalHeight, lineHeight * 4 + pt + pb);

			container.style.height = `${Math.max(visibleHeight, lineHeight * 4 + pt + pb)}px`;

			// snap to line grid to prevent cursor dip at word boundaries
			const lineNumber = Math.round(span.offsetTop / lineHeight);

			const raf = requestAnimationFrame(() => {
				const x = pl + span.offsetLeft;
				const y = pt + lineNumber * lineHeight - activeOffset;

				setOppCursorPoses((prev) => {
					const updated = { ...prev };
					updated[userId] = { x, y };
					return updated;
				});
			});

			cleanups.push(() => cancelAnimationFrame(raf));
		}

		return () => {
			for (const cleanup of cleanups) cleanup();
		};
	}, [
		typingIndexes,
		containerRef,
		charRefs,
		scrollOffset,
		manualScrollOffset,
		enabled,
	]);

	// reset lineHeight cache on resize
	useLayoutEffect(() => {
		function handleResize() {
			lineHeightRef.current = 0;
		}
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return {
		oppCursorPoses,
	};
}
