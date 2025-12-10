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

	// cached to avoid recalculating every keystroke, reset on resize
	const lineHeightRef = useRef<number>(0);

	function calculatePosition() {
		const span = charRefs.current?.[index];
		const container = containerRef.current;
		if (!span || !container) return;
		const containerStyle = getComputedStyle(container);

		const firstChar = charRefs.current?.[0];

		// calculate lineHeight from actual line spacing (diff btw line 0 and 1)
		// NOT from span.offsetHeight which is ele height and differs from line spacing
		// threshold > 10 to ignore the ~3px dip at word boundaries (i still dont know why tf this happens)
		if (lineHeightRef.current === 0 && firstChar && span !== firstChar) {
			const firstLineTop = firstChar.offsetTop;
			const currentLineTop = span.offsetTop;
			const diff = currentLineTop - firstLineTop;
			if (diff > 10) {
				lineHeightRef.current = diff;
			}
		}
		const lineHeight = lineHeightRef.current || span.offsetHeight;

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

		// snap to line grid to prevent cursor dip at word boundaries
		// (last char of word has slightly different offsetTop, coz fucking why not, browsers)
		const stableOffsetTop =
			Math.round(span.offsetTop / lineHeight) * lineHeight;

		const maxScrollOffset = Math.max(
			0,
			(container?.scrollHeight ?? 0) - (container?.clientHeight ?? 0),
		);
		const targetOffset = Math.min(
			Math.max(stableOffsetTop - lineHeight, 0),
			maxScrollOffset,
		);

		if (targetOffset !== scrollOffset) {
			setScrollOffset(targetOffset);
		}

		const raf = requestAnimationFrame(() => {
			const x = pl + span.offsetLeft;
			// snap lineNumber to avoid dip from varying offsetTop at word boundaries
			const lineNumber = Math.round(span.offsetTop / lineHeight);
			let y: number;

			if (manualScrollOffset !== null) {
				y = pt + lineNumber * lineHeight - manualScrollOffset;
			} else {
				// same targetOffset as actual scroll to stay in sync
				y = pt + lineNumber * lineHeight - targetOffset;
			}
			setCursorPos({ x, y });
		});

		return () => cancelAnimationFrame(raf);
	}

	useLayoutEffect(() => {
		const cleanup = calculatePosition();
		let resizeCleanup: (() => void) | undefined;

		const handleResize = () => {
			// reset cached lineHeight on resize coz font size may change, responsiveness :'(
			lineHeightRef.current = 0;
			resizeCleanup?.();
			resizeCleanup = calculatePosition();
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			cleanup?.();
			resizeCleanup?.();
		};
	}, [index, manualScrollOffset, containerRef, charRefs]);

	return {
		scrollOffset,
		cursorPos,
	};
}
