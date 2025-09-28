import { getMatchStatus } from "@/services/pvp.server";
import InvalidCodePage from "./InvalidCode";
import { MatchPage } from "./MatchPage";

export default async function PvpPage({
	params,
	searchParams,
}: {
	params: Promise<{ matchCode: string }>;
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	const matchCode = await params.then((p) => p.matchCode);
	const sp = await searchParams;
	const isHost = sp.isHost === "true";
	const matchStatus = await getMatchStatus(matchCode);
	if (matchStatus !== "waiting") {
		return <InvalidCodePage status={matchStatus} />;
	}
	return <MatchPage isHost={isHost} matchCode={matchCode} />;
}
