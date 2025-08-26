import { getUserStats } from "@/services/user.server";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Stats } from "@brawltype/types";

function StatCard({
	title,
	value,
	suffix = "",
	icon,
}: {
	title: string;
	value: number;
	suffix?: string;
	icon?: string;
}) {
	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div>
						<p className="text-sm font-medium text-muted-foreground">{title}</p>
						<p className="text-2xl font-bold">
							{value.toLocaleString()}
							{suffix && (
								<span className="text-lg text-muted-foreground ml-1">
									{suffix}
								</span>
							)}
						</p>
					</div>
					{icon && <span className="text-2xl">{icon}</span>}
				</div>
			</CardContent>
		</Card>
	);
}

function StatsGrid({ data }: { data: Stats }) {
	const winRate =
		data.pvpMatches > 0 ? ((data.wins / data.pvpMatches) * 100).toFixed(1) : 0;
	const totalMatches = data.soloMatches + data.pvpMatches;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<StatCard title="Total Matches" value={totalMatches} icon="⚔️" />
			<StatCard title="PvP Wins" value={data.wins} icon="🏆" />
			<StatCard title="Win Rate" value={Number(winRate)} suffix="%" icon="📊" />
			<StatCard
				title="Highest WPM"
				value={data.highestWpm}
				suffix="WPM"
				icon="🚀"
			/>
			<StatCard
				title="Avg PvP WPM"
				value={data.avgWpmPvp}
				suffix="WPM"
				icon="⚡"
			/>
			<StatCard
				title="Avg Accuracy"
				value={data.avgAccuracyPvp}
				suffix="%"
				icon="🎯"
			/>
			<StatCard title="Words Typed" value={data.wordsTyped} icon="📝" />
			<StatCard
				title="Time Played"
				value={Math.round(data.totalTimePlayed / 60)}
				suffix="min"
				icon="⏱️"
			/>
			<StatCard title="Solo Sessions" value={data.soloMatches} icon="🎮" />
		</div>
	);
}

export async function StatsView() {
	const data = await getUserStats();

	return (
		<div className="container max-w-6xl mx-auto py-8">
			<div className="space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold">Your Stats</h1>
					<p className="text-muted-foreground text-lg">
						Track your typing performance and progress
					</p>
				</div>

				<Separator />

				<StatsGrid data={data} />

				<Card>
					<CardHeader>
						<CardTitle>Performance Insights</CardTitle>
						<CardDescription>
							Key metrics about your typing performance
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex justify-between">
								<span className="font-medium">Peak Performance:</span>
								<span>{data.highestWpm} WPM</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Consistency:</span>
								<span>{data.avgAccuracyPvp}% accuracy</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Dedication:</span>
								<span>{Math.round(data.totalTimePlayed / 3600)}h played</span>
							</div>
							<div className="flex justify-between">
								<span className="font-medium">Experience:</span>
								<span>{data.wordsTyped.toLocaleString()} words</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
