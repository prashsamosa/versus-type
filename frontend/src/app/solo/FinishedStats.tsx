"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getAccuracy, getErrorCount } from "@/lib/accuracy";
import { authClient } from "@/lib/auth-client";
import { computeStats } from "@/lib/stats";
import { completeTest } from "@/services/test.client";

type TestStats = {
	wpm: number;
	rawWpm: number;
	accuracy: number;
	correctChars: number;
	errorChars: number;
	time: number;
	wordsTyped: number;
	mode: "time" | "words";
};

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
	const errors = getErrorCount();
	const [saving, setSaving] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { data: session } = authClient.useSession();

	useEffect(() => {
		if (!session?.user) {
			setSaving(false);
			return;
		}
		const testStats: TestStats = {
			wpm: stats.wpm,
			rawWpm: stats.rawWpm,
			accuracy: acc.acc,
			correctChars: stats.correctChars,
			errorChars: stats.incorrectChars + stats.extraChars + stats.missedChars,
			time: stats.time,
			wordsTyped: inputWords.length,
			mode: "words",
		};
		const callComplete = async () => {
			try {
				await completeTest(testStats);
			} catch (err) {
				console.error("Failed to save result", err);
				setError("Failed to save result");
			} finally {
				setSaving(false);
			}
		};
		callComplete();
	}, [session]);

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
						<div className="text-3xl font-bold">{errors}</div>
					</div>
				</div>
				{saving && (
					<div className="text-center text-muted-foreground mt-4">
						Saving result...
					</div>
				)}
				{error && <div className="text-center text-red-500 mt-4">{error}</div>}
			</CardContent>
			<CardFooter className="justify-center gap-3">
				<Button onClick={onRestartAction}>Restart</Button>
			</CardFooter>
		</Card>
	);
}
