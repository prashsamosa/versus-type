import { getMatchStatus } from "@/services/pvp.server";
import Chat from "./Chat";
import InvalidCodePage from "./InvalidCode";

export default async function PvpPage({
	params,
}: {
	params: Promise<{ matchCode: string }>;
}) {
	const matchCode = await params.then((p) => p.matchCode);
	const matchStatus = await getMatchStatus(matchCode);
	if (matchStatus !== "waiting") {
		return <InvalidCodePage status={matchStatus} />;
	}
	return <Chat />;
}
