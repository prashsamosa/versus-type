"use client";

import { recordKey } from "@versus-type/shared/accuracy";
import { useRef, useState } from "react";
import { sendKeystroke } from "../socket/pvp.socket.service";

export function usePvpTypingState(words: string[]) {
	const passageChars = words.join(" ");

	const [typedText, setTypedText] = useState("");
	const [finished, setFinished] = useState(false);
	const startRef = useRef<number | null>(null);
	const endRef = useRef<number | null>(null);
	const prevInputRef = useRef("");

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		const val = e.target.value;

		const prev = prevInputRef.current;
		const idx = prev.length;
		if (val.length === prev.length + 1 && val.startsWith(prev)) {
			const typed = val[idx];
			const expected = passageChars[idx];
			sendKeystroke(typed);
			recordKey(typed, expected);
		} else if (val.length < prev.length && prev.startsWith(val)) {
			// Handle backspace
		} else {
			// Handle paste or other edits
			return;
		}
		prevInputRef.current = val;

		setTypedText(val);

		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passageChars.length && !finished) {
			endRef.current = performance.now();
			setFinished(true);
		}
	}

	// function restartTest() {
	// 	setWords(generateWords(config));
	// 	setTypedText("");
	// 	startRef.current = null;
	// 	endRef.current = null;
	// 	prevInputRef.current = "";
	// 	resetAccuracy();
	// 	setFinished(false);
	// }

	return {
		passageChars,
		typedText,
		finished,
		startRef,
		endRef,
		handleInputChange,
	};
}
