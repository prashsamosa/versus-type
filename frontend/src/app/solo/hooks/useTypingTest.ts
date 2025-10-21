"use client";

import {
	type AccuracyState,
	recordKey,
	resetAccuracy,
} from "@versus-type/shared/accuracy";
import {
	type GeneratorConfig,
	generateWords,
} from "@versus-type/shared/passage-generator";
import { useRef, useState } from "react";

export function useTypingTest(config: GeneratorConfig, initialWords: string[]) {
	const [words, setWords] = useState(initialWords);
	const passageChars = words.join(" ");

	const [typedText, setTypedText] = useState("");
	const [finished, setFinished] = useState(false);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const prevInputRef = useRef("");
	const accuracyRef = useRef<AccuracyState>(resetAccuracy());

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const val = e.target.value;

		const prev = prevInputRef.current;
		const idx = prev.length;
		if (val.length === prev.length + 1 && val.startsWith(prev)) {
			const typed = val[idx];
			const expected = passageChars[idx];
			accuracyRef.current = recordKey(accuracyRef.current, typed, expected);
		}
		prevInputRef.current = val;

		setTypedText(val);

		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passageChars.length && !finished) {
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	function restartTest() {
		setWords(generateWords(config));
		setTypedText("");
		startRef.current = null;
		endRef.current = null;
		prevInputRef.current = "";
		accuracyRef.current = resetAccuracy();
		setFinished(false);
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Tab") {
			e.preventDefault();
			restartTest();
		}
	}

	return {
		words,
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		accuracyRef,
		handleInputChange,
		restartTest,
		handleKeyDown,
	};
}
