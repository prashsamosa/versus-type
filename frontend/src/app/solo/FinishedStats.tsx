"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getAccuracy } from "@/lib/accuracy";
import { computeStats } from "@/lib/stats";

export default function FinishedStats({
	startTs,
	endTs,
	input,
	target,
	onRestartAction,
}: {
	startTs: number;
	endTs: number;
	input: string;
	target: string;
	onRestartAction: () => void;
}) {
	const inputWords = input.trim().split(/\s+/);
	const targetWords = target.trim().split(/\s+/);
	const stats = computeStats(startTs, endTs, inputWords, targetWords);
	const acc = getAccuracy();

	return (
		<Card className="max-w-3xl mx-auto mt-10">
			<CardContent>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
					<div>
						<div className="text-sm text-muted-foreground">WPM</div>
						<div className="text-3xl font-bold">{Math.round(stats.wpm)}</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground">Raw</div>
						<div className="text-3xl font-bold">{Math.round(stats.rawWpm)}</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground">Time</div>
						<div className="text-3xl font-bold">{stats.time}s</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground">Acc</div>
						<div className="text-3xl font-bold">{Math.round(acc.acc)}%</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground">Correct</div>
						<div className="text-3xl font-bold">{stats.correctChars}</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground">Errors</div>
						<div className="text-3xl font-bold">
							{stats.incorrectChars + stats.missedChars + stats.extraChars}
						</div>
					</div>
				</div>
			</CardContent>
			<CardFooter className="justify-center gap-3">
				<Button onClick={onRestartAction}>Restart</Button>
			</CardFooter>
		</Card>
	);
}
