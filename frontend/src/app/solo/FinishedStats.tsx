"use client";

import {
	type AccuracyState,
	getAccuracy,
	getErrorCount,
} from "@versus-type/shared/accuracy";
import type { SoloStats } from "@versus-type/shared/index";
import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { computeStats } from "@versus-type/shared/stats";
import confetti from "canvas-confetti";
import {
	Clock,
	Flame,
	Gauge,
	RotateCcw,
	Settings2,
	Target,
	XCircle,
	Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressStatCard, StatCard } from "@/components/ui/stat-card";
import { authClient } from "@/lib/auth-client";
import { completeSoloMatch } from "@/services/solo.client";

export default function FinishedStats({
	startTs,
	endTs,
	input,
	target,
	onRestartAction,
	accuracyState,
	maxStreak,
	passageConfig,
}: {
	startTs: number;
	endTs: number;
	input: string;
	target: string;
	onRestartAction: () => void;
	accuracyState: AccuracyState;
	maxStreak: number;
	passageConfig: GeneratorConfig;
}) {
	const stats = computeStats(startTs, endTs, input, target);
	const acc = getAccuracy(accuracyState);
	const errors = getErrorCount(accuracyState);
	const [saving, setSaving] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const user = authClient.useSession().data?.user;
	const hasSaved = useRef(false);
	const [isNewHighest, setIsNewHighest] = useState(false);

	function fireConfetti() {
		confetti({
			angle: 60,
			spread: 55,
			origin: { x: 0, y: 0.6 },
		});
		confetti({
			angle: 120,
			spread: 55,
			origin: { x: 1, y: 0.6 },
		});
	}

	useEffect(() => {
		if (hasSaved.current) return;
		if (!user) {
			setSaving(false);
			return;
		}
		if (!stats) {
			setSaving(false);
			return;
		}
		setSaving(true);
		hasSaved.current = true;
		const finalStats: SoloStats = {
			wpm: stats.wpm,
			rawWpm: stats.rawWpm,
			accuracy: acc,
			correctChars: stats.correctChars,
			errorChars: stats.incorrectChars,
			time: stats.time,
			wordsTyped: input.trim().split(/\s+/).length,
			mode: "words",
			passageConfig,
			maxStreak,
		};
		async function callComplete() {
			try {
				const isNewHighest_ = await completeSoloMatch(finalStats);
				setIsNewHighest(isNewHighest_);
				if (isNewHighest_) {
					fireConfetti();
				}
			} catch (err) {
				console.error("Failed to save result", err);
				setError(
					"Failed to save result: " +
						(err instanceof Error ? err.message : "Unknown error"),
				);
			} finally {
				setSaving(false);
			}
		}
		callComplete();
	}, [user]);

	if (!stats) {
		return (
			<div className="max-w-4xl mx-auto mt-10">
				<Card>
					<CardContent className="p-6">
						<div className="text-center text-destructive">
							Failed to compute stats
						</div>
						<div className="flex justify-center mt-4">
							<Button onClick={onRestartAction}>
								<RotateCcw className="size-4 mr-2" />
								Restart
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto mt-10 space-y-4">
			<div className="grid grid-cols-4 gap-4">
				<StatCard
					value={Math.round(stats.wpm)}
					suffix="WPM"
					size="large"
					icon={Zap}
					className="col-span-2 row-span-2"
					tag={isNewHighest ? "New Highest" : undefined}
				/>
				<StatCard
					title="Raw WPM"
					value={Math.round(stats.rawWpm)}
					suffix="WPM"
					icon={Gauge}
					className="min-w-[13rem]"
				/>
				<StatCard title="Time" value={stats.time} suffix="s" icon={Clock} />

				<StatCard title="Max Streak" value={maxStreak} icon={Flame} />
				<StatCard title="Errors" value={errors} icon={XCircle} />

				<ProgressStatCard
					size="large"
					title="Accuracy"
					value={Math.round(acc)}
					icon={Target}
					className="col-span-2"
				/>
				<StatCard title="Config" icon={Settings2} className="col-span-2">
					<div className="text-sm flex gap-2">
						<div>{passageConfig.language}</div>
						<span className="text-foreground/40">•</span>
						<div>{passageConfig.wordCount} words</div>
						{passageConfig.punctuation ? (
							<>
								<span className="text-foreground/40">•</span>
								<div>Punctuation</div>{" "}
							</>
						) : null}

						{passageConfig.numbers ? (
							<>
								<span className="text-foreground/40">•</span>
								<div>Numbers</div>{" "}
							</>
						) : null}
					</div>
				</StatCard>
			</div>

			<div className="flex justify-center pt-2">
				<Button size="lg" onClick={onRestartAction}>
					<RotateCcw className="size-4 mr-2" />
					Restart
				</Button>
			</div>
			<div
				className={
					"text-center text-muted-foreground " +
					(saving ? "opacity-100" : "opacity-0")
				}
			>
				Saving result...
			</div>
			{error && <div className="text-center text-destructive">{error}</div>}
		</div>
	);
}
