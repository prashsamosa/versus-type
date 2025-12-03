"use client";

import {
	type AccuracyState,
	recordKey,
	resetAccuracy,
} from "@versus-type/shared/accuracy";
import { useEffect, useRef, useState } from "react";

export function useTypingTest(words: string[]) {
	const passageChars = words.join(" ");

	const [typedText, setTypedText] = useState("");
	const [finished, setFinished] = useState(false);
	const [incorrect, setIncorrect] = useState(false);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const prevInputRef = useRef("");
	const accuracyRef = useRef<AccuracyState>(resetAccuracy());

	function resetState() {
		setTypedText("");
		setFinished(false);
		setIncorrect(false);
		startRef.current = null;
		endRef.current = null;
		prevInputRef.current = "";
		accuracyRef.current = resetAccuracy();
	}

	useEffect(() => {
		resetState();
	}, [words]);

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (finished) return;
		const val = e.target.value;
		let incorrectCurr = incorrect;

		const prev = prevInputRef.current;
		const idx = prev.length;

		if (val.length === prev.length + 1 && val.startsWith(prev)) {
			if (idx >= passageChars.length) return;
			const typed = val[idx];
			const expected = passageChars[idx];
			accuracyRef.current = recordKey(accuracyRef.current, typed, expected);
			if (typed !== expected) {
				setIncorrect(true);
				incorrectCurr = true;
			}
		} else if (val.length < prev.length && prev.startsWith(val)) {
			if (incorrect && val === passageChars.slice(0, val.length)) {
				setIncorrect(false);
				incorrectCurr = false;
			}
		} else {
			return;
		}

		prevInputRef.current = val;
		setTypedText(val);

		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passageChars.length && !finished && !incorrectCurr) {
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	function handleKeyDown(
		e: React.KeyboardEvent<HTMLInputElement>,
		onRestart: (fromFinishScreen: boolean) => void,
	) {
		if (e.key === "Tab") {
			e.preventDefault();
			resetState();
			onRestart(false);
		}
	}

	return {
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		accuracyRef,
		handleInputChange,
		handleKeyDown,
		incorrect,
	};
}
