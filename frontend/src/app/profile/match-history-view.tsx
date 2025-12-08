import { History } from "lucide-react";
import { getMatchHistory } from "@/services/user.server";
import { MatchHistoryList } from "./match-history";

export async function MatchHistoryView() {
	const data = await getMatchHistory();

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<History className="size-5 text-primary" />
				<h2 className="text-xl font-semibold">Match History</h2>
			</div>
			<MatchHistoryList initialData={data} />
		</div>
	);
}
