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
) {
	const [oppCursorPoses, setOppCursorPoses] = useState<
		Record<string, CursorData>
	>(
		Object.fromEntries(
			Object.keys(typingIndexes).map((userId) => [userId, { x: 0, y: 0 }]),
		),
	);

	const lineHeightRefs = useRef<Record<string, number>>({});

	useLayoutEffect(() => {
		const cleanups: (() => void)[] = [];

		const activeOffset =
			manualScrollOffset === null ? scrollOffset : manualScrollOffset;

		for (const [userId, typingPos] of Object.entries(typingIndexes)) {
			const span = charRefs.current?.[typingPos];
			const container = containerRef.current;
			if (!span || !container) continue;

			const containerStyle = getComputedStyle(container);

			if (!lineHeightRefs.current[userId] && span.offsetHeight > 0) {
				lineHeightRefs.current[userId] = span.offsetHeight;
			}
			const lineHeight = lineHeightRefs.current[userId];

			const pt = parseFloat(containerStyle.paddingTop) || 0;
			const pb = parseFloat(containerStyle.paddingBottom) || 0;
			const pl = parseFloat(containerStyle.paddingLeft) || 0;

			const totalHeight =
				span.offsetParent?.scrollHeight ?? container.scrollHeight;
			const visibleHeight = Math.min(totalHeight, lineHeight * 4 + pt + pb);

			container.style.height = `${Math.max(visibleHeight, lineHeight * 4 + pt + pb)}px`;

			const stableOffsetTop =
				Math.round(span.offsetTop / lineHeight) * lineHeight;

			const raf = requestAnimationFrame(() => {
				const x = pl + span.offsetLeft;
				const y = pt + stableOffsetTop - activeOffset;

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
	}, [typingIndexes, containerRef, charRefs, scrollOffset, manualScrollOffset]);

	return {
		oppCursorPoses,
	};
}
