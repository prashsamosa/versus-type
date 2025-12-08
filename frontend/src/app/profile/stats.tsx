import type { UserStats } from "@versus-type/shared/index";
import { redirect } from "next/navigation";
import { getUserStats } from "@/services/user.server";
import { StatsGrid } from "./stats-grid";

export async function StatsView() {
	let data: UserStats;
	try {
		data = await getUserStats();
	} catch (e: any) {
		if (e.cause === 401) {
			redirect("/anonymous-sign?from=/profile");
		} else throw e;
	}
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
			maxStreak={data.maxStreak}
		/>
	);
}
