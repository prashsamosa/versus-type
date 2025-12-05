"use client";

import {
	Clock,
	Gamepad2,
	Rocket,
	Swords,
	Target,
	TrendingUp,
	Trophy,
	Zap,
} from "lucide-react";
import { ProgressStatCard, StatCard } from "@/components/ui/stat-card";

type StatsGridProps = {
	avgWpm: number;
	highestWpm: number;
	avgAccuracy: number;
	wins: number;
	winRate: number;
	totalMatches: number;
	soloMatches: number;
	timePlayed: number;
};

export function StatsGrid({
	avgWpm,
	highestWpm,
	avgAccuracy,
	wins,
	winRate,
	totalMatches,
	soloMatches,
	timePlayed,
}: StatsGridProps) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<StatCard
				title="Avg WPM"
				value={avgWpm}
				suffix="WPM"
				size="large"
				icon={Zap}
				className="col-span-2 row-span-2"
			/>

			<StatCard
				title="Highest WPM"
				value={highestWpm}
				suffix="WPM"
				icon={Rocket}
			/>
			<ProgressStatCard title="Accuracy" value={avgAccuracy} icon={Target} />
			<StatCard title="PvP Wins" value={wins} icon={Trophy} />
			<ProgressStatCard title="Win Rate" value={winRate} icon={TrendingUp} />

			<StatCard title="Total Matches" value={totalMatches} icon={Swords} />
			<StatCard title="Solo Sessions" value={soloMatches} icon={Gamepad2} />

			<StatCard
				title="Time Played"
				value={timePlayed}
				suffix="min"
				icon={Clock}
				className="col-span-2"
			/>
		</div>
	);
}
