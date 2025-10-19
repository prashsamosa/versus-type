"use client";

import { recordKey } from "@versus-type/shared/accuracy";
import { useRef, useState } from "react";
import { getWordIndex, getWordStartIndex, isWordCorrect } from "@/lib/utils";
import { sendBackspace, sendKeystroke } from "../socket/pvp.socket.service";

export function usePvpTypingState(words: string[]) {
	const passageChars = words.join(" ");

	const [typedText, setTypedText] = useState("");
	const [finished, setFinished] = useState(false);
	const [shakeWordIndex, setShakeWordIndex] = useState<number | null>(null);
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
			recordKey(typed, expected, () => sendKeystroke(typed));
		} else if (val.length < prev.length && prev.startsWith(val)) {
			sendBackspace(prev.length - val.length);
		} else {
			// paste or other edits
			return;
		}

		const prevWordIdx = getWordIndex(prev.length, words);
		const newWordIdx = getWordIndex(val.length, words);

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

		prevInputRef.current = val;

		setTypedText(val);

		if (startRef.current === null) startRef.current = performance.now();

		if (val.length >= passageChars.length && !finished) {
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
	};
}
