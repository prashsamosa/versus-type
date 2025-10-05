import type { PlayerInfo } from "@versus-type/shared/index";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

export function Lobby({
	players,
	playerColors,
}: {
	players: PlayerInfo[];
	playerColors: Record<string, string>;
}) {
	const userId = authClient.useSession().data?.user.id;
	return (
		<Card className="h-full p-2 gap-2">
			<div className="border-b p-2 pb-3 flex justify-between items-center">
				Lobby <Badge>{players.length} players</Badge>
			</div>
			<div className="flex flex-col p-2 gap-2 overflow-y-auto">
				{players.map((player) => (
					<div key={player.userId} className="flex items-center gap-2">
						<div className="flex gap-2">
							<span
								className={`${player.userId === userId ? "font-bold" : ""} ${player.userId ? (playerColors[player.userId] ?? "") : ""}`}
							>
								{player.username}{" "}
							</span>
							{player.isHost ? <Badge variant="secondary">Host</Badge> : null}
						</div>
					</div>
				))}
			</div>
		</Card>
	);
}
