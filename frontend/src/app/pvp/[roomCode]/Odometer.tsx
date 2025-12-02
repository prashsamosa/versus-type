"use client";
import { useEffect, useRef } from "react";

function computeShortDelta(delta: number): number {
	return Math.abs(delta) > 5 ? delta + (delta > 0 ? -10 : 10) : delta;
}

export function Odometer({ value }: { value: number }) {
	const clampedValue = Math.max(0, Math.min(99, Math.floor(value)));
	const prevRef = useRef<number | undefined>(undefined);
	const unitsRef = useRef<number | null>(null);
	const tensRef = useRef<number | null>(null);
	const stackLength = 20;

	const newUnitsD = clampedValue % 10;
	const newTensD = Math.floor(clampedValue / 10);

	// Units digit (always present)
	let unitsOffset: number;
	if (unitsRef.current === null) {
		unitsOffset = 10 + newUnitsD;
	} else {
		const oldUnitsD = unitsRef.current % 10;
		const deltaU = newUnitsD - oldUnitsD;
		const shortDeltaU = computeShortDelta(deltaU);
		let tempOff = unitsRef.current + shortDeltaU;
		if (tempOff < 0) tempOff += stackLength;
		if (tempOff >= stackLength) tempOff -= stackLength;
		unitsOffset = tempOff;
	}

	// Tens digit
	let tensOffset: number | null = null;
	if (tensRef.current === null) {
		tensOffset = 10 + newTensD;
	} else {
		const oldTensD = tensRef.current % 10;
		const deltaT = newTensD - oldTensD;
		const shortDeltaT = computeShortDelta(deltaT);
		let tempOff = tensRef.current + shortDeltaT;
		if (tempOff < 0) tempOff += stackLength;
		if (tempOff >= stackLength) tempOff -= stackLength;
		tensOffset = tempOff;
	}

	useEffect(() => {
		unitsRef.current = unitsOffset;
		if (tensOffset !== null) {
			tensRef.current = tensOffset;
		}
		prevRef.current = clampedValue;
	}, [clampedValue, unitsOffset, tensOffset]);

	const tensVisible = newTensD > 0;
	const displayTensOffset = tensOffset ?? tensRef.current ?? 10;

	return (
		<div className="flex items-start font-mono leading-none h-[1em] overflow-hidden">
			<div
				className="transition-all duration-500 ease-out overflow-hidden"
				style={{
					marginTop: `-${displayTensOffset}em`,
					width: tensVisible ? "0.6em" : "0",
					opacity: tensVisible ? 1 : 0,
				}}
			>
				{Array.from({ length: stackLength }, (_, i) => (
					<div key={i} className="h-[1em] leading-[1em]">
						{i % 10}
					</div>
				))}
			</div>
			<div
				className="transition-all duration-500 ease-[cubic-bezier(.09,.51,.34,.99)]"
				style={{ marginTop: `-${unitsOffset}em` }}
			>
				{Array.from({ length: stackLength }, (_, i) => (
					<div key={i} className="h-[1em] leading-[1em]">
						{i % 10}
					</div>
				))}
			</div>
		</div>
	);
}
