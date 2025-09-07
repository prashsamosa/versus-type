"use client";

import { useLayoutEffect, useRef, useState } from "react";

export function useCursorPosition(typedText: string) {
	const [scrollOffset, setScrollOffset] = useState(0);
	const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({
		x: 0,
		y: 0,
	});

	const containerRef = useRef<HTMLDivElement>(null);
	const charRefs = useRef<HTMLSpanElement[]>([]);
	const lineHeightRef = useRef<number>(0);

	useLayoutEffect(() => {
		const index = typedText.length;
		const span = charRefs.current[index];
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
	}, [typedText, scrollOffset]);

	return {
		scrollOffset,
		cursorPos,
		containerRef,
		charRefs,
	};
}
