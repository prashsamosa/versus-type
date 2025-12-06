import { getUserStats } from "@/services/user.server";
import { StatsGrid } from "./stats-grid";

export async function StatsView() {
	const data = await getUserStats();
	const winRate =
		data.pvpMatches > 0 ? Math.round((data.wins / data.pvpMatches) * 100) : 0;
	const totalMatches = data.soloMatches + data.pvpMatches;

	return (
		<StatsGrid
			avgWpm={Number(data.avgWpm.toFixed(0))}
			highestWpm={Number(data.highestWpm.toFixed(0))}
			avgAccuracy={data.avgAccuracy}
			wins={data.wins}
			winRate={winRate}
			totalMatches={totalMatches}
			soloMatches={data.soloMatches}
			timeTyped={Math.round(data.totalTimeTyped / 60)}
			rollingAvgWpm={Number(data.rollingAvgWpm.toFixed(0))}
		/>
	);
}
