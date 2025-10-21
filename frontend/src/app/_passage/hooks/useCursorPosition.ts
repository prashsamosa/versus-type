"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function useCursorPosition(
	index: number,
	containerRef: React.RefObject<HTMLDivElement | null>,
	charRefs: React.RefObject<HTMLSpanElement[] | null>,
	manualScrollOffset: number | null = null,
) {
	const [scrollOffset, setScrollOffset] = useState(0);
	const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});

	const lineHeightRef = useRef<number>(0);

	useLayoutEffect(() => {
		const span = charRefs.current?.[index];
		const container = containerRef.current;
		if (!span || !container) return;
		const containerStyle = getComputedStyle(container);

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

		container.style.height = `${Math.max(
			visibleHeight,
			lineHeight * 4 + pt + pb,
		)}px`;
		const stableOffsetTop =
			Math.round(span.offsetTop / lineHeight) * lineHeight;

		const maxScrollOffset = Math.max(
			0,
			(container?.scrollHeight ?? 0) - (container?.clientHeight ?? 0),
		);
		// const targetOffset = Math.max(stableOffsetTop - lineHeight, 0);
		const targetOffset = Math.min(
			Math.max(stableOffsetTop - lineHeight, 0),
			maxScrollOffset,
		);

		if (targetOffset !== scrollOffset) {
			setScrollOffset(targetOffset);
		}

		const raf = requestAnimationFrame(() => {
			const x = pl + span.offsetLeft;
			let y: number;

			if (manualScrollOffset !== null) {
				y = pt + stableOffsetTop - manualScrollOffset;
			} else {
				y = pt + (stableOffsetTop - targetOffset);
			}

			setCursorPos({ x, y });
		});

		return () => cancelAnimationFrame(raf);
	}, [index, manualScrollOffset, containerRef, charRefs]);

	return {
		scrollOffset,
		cursorPos,
	};
}
