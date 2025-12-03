"use client";

import { useEffect, useRef, useState } from "react";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { getWordIndex, getWordStartIndex, isWordCorrect } from "@/lib/utils";
import { socket } from "@/socket";
import { sendBackspace, sendKeystrokes } from "../socket/pvp.socket.service";

const FLUSH_TIMEOUT = 700;

export function usePvpTypingState(words: string[], initialIndex: number) {
	const passageChars = words.join(" ");
	useEffect(() => {
		if (initialIndex > 0) {
			setTypedText(passageChars.slice(0, initialIndex));
			prevInputRef.current = passageChars.slice(0, initialIndex);
			if (initialIndex >= passageChars.length) {
				setFinished(true);
			}
		}
	}, [initialIndex, passageChars.length]);

	const [typedText, setTypedText] = useState("");
	const [finished, setFinished] = useState(false);
	const [shakeWordIndex, setShakeWordIndex] = useState<number | null>(null);
	const [incorrect, setIncorrect] = useState(false);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const prevInputRef = useRef("");
	const keysBufferRef = useRef<string>("");
	const flushTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const bufferSize = useRef<number>(20);

	function flushBuffer() {
		if (keysBufferRef.current) {
			sendKeystrokes(keysBufferRef.current);
			keysBufferRef.current = "";
		}
		if (flushTimeoutRef.current) {
			clearTimeout(flushTimeoutRef.current);
			flushTimeoutRef.current = null;
		}
	}

	function resetTypingState() {
		setTypedText("");
		setFinished(false);
		setShakeWordIndex(null);
		setIncorrect(false);
		startRef.current = null;
		endRef.current = null;
		prevInputRef.current = "";
		keysBufferRef.current = "";
		if (flushTimeoutRef.current) {
			clearTimeout(flushTimeoutRef.current);
			flushTimeoutRef.current = null;
		}
	}

	useEffect(() => {
		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:key-buffer-size": (keyBufferSize: number) => {
				bufferSize.current = keyBufferSize;
			},
		});
		return () => {
			unregister();
			if (flushTimeoutRef.current) {
				clearTimeout(flushTimeoutRef.current);
			}
		};
	}, []);

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (finished) return;
		const val = e.target.value;
		let incorrectCurr = incorrect; // to avoid stale incorrect state, for finished check

		const prev = prevInputRef.current;
		const idx = prev.length;

		const prevWordIdx = getWordIndex(prev.length, words);
		const newWordIdx = getWordIndex(val.length, words);

		// check if previous words are correct when moving to a new word
		if (newWordIdx > prevWordIdx) {
			for (let i = 0; i < prevWordIdx; i++) {
				const wordStart = getWordStartIndex(i, words);
				if (!isWordCorrect(val, words[i], wordStart)) {
					setShakeWordIndex(i);
					setTimeout(() => setShakeWordIndex(null), 400);
					return;
				}
			}
		}

		if (val.length === prev.length + 1 && val.startsWith(prev)) {
			if (idx >= passageChars.length) return;
			const typed = val[idx];
			const expected = passageChars[idx];
			if (typed !== expected) {
				setIncorrect(true);
				incorrectCurr = true;
			}
			keysBufferRef.current += typed;
			if (
				val.length === 1 ||
				keysBufferRef.current.length >= bufferSize.current
			) {
				flushBuffer();
			} else if (!flushTimeoutRef.current) {
				flushTimeoutRef.current = setTimeout(flushBuffer, FLUSH_TIMEOUT);
			}
		} else if (val.length < prev.length && prev.startsWith(val)) {
			// backspace(s) detected
			if (incorrect && val === passageChars.slice(0, val.length)) {
				setIncorrect(false);
				incorrectCurr = false;
			}

			const amountToSend =
				prev.length - val.length - keysBufferRef.current.length;

			if (amountToSend > 0) {
				sendBackspace(amountToSend);
				keysBufferRef.current = "";
			} else {
				keysBufferRef.current = keysBufferRef.current.slice(0, -amountToSend);
			}
		} else {
			// paste or other edits
			return;
		}

		prevInputRef.current = val;

		setTypedText(val);

		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passageChars.length && !finished && !incorrectCurr) {
			flushBuffer();
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	return {
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		handleInputChange,
		shakeWordIndex,
		incorrect,
		resetTypingState,
	};
}
