import { Card, CardContent } from "@/components/ui/card";
import { getUserStats } from "@/services/user.server";

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

export async function StatsView() {
	const data = await getUserStats();
	const winRate =
		data.pvpMatches > 0 ? ((data.wins / data.pvpMatches) * 100).toFixed(1) : 0;
	const totalMatches = data.soloMatches + data.pvpMatches;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			<StatCard title="Total Matches" value={totalMatches} icon="⚔" />
			<StatCard title="PvP Wins" value={data.wins} icon="🏆" />
			<StatCard title="Win Rate" value={Number(winRate)} suffix="%" icon="📊" />
			<StatCard
				title="Highest WPM"
				value={data.highestWpm}
				suffix="WPM"
				icon="🚀"
			/>
			<StatCard title="Avg WPM" value={data.avgWpm} suffix="WPM" icon="⚡" />
			<StatCard
				title="Avg Accuracy"
				value={data.avgAccuracy}
				suffix="%"
				icon="🎯"
			/>
			<StatCard
				title="Time Played"
				value={Math.round(data.totalTimeTyped / 60)}
				suffix="min"
				icon="⏱"
			/>
			<StatCard title="Solo Sessions" value={data.soloMatches} icon="🎮" />
		</div>
	);
}
