import type { PlayerInfo } from "@versus-type/shared/index";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";

export function Lobby({
	players,
	playerColors,
}: {
	players: PlayerInfo[];
	playerColors: Record<string, string>;
}) {
	const [countdownStarted, setCountdownStarted] = useState(false);
	const userId = authClient.useSession().data?.user.id;
	const isHost = players.some(
		(player) => player.isHost && player.userId === userId,
	);
	async function handleStartCountdown() {
		const response = await socket?.emitWithAck("pvp:start-match");
		if (response?.success) setCountdownStarted(true);
	}
	return (
		<Card className="h-full p-2 gap-2 relative">
			<div className="border-b p-2 pb-3 flex justify-between items-center">
				Lobby <Badge>{players.length} players</Badge>
			</div>
			<div className="flex flex-col p-2 gap-2 overflow-y-auto">
				{players.map((player) => (
					<div key={player.userId} className="flex items-center gap-2">
						<div className="flex gap-2">
							<span
								className={`${player.userId === userId ? "font-bold" : ""} ${player.disconnected ? " text-gray-500" : ""}`}
								style={
									player.userId ? { color: playerColors[player.userId] } : {}
								}
							>
								{player.username}{" "}
							</span>
							{player.isHost && !countdownStarted ? (
								<Badge variant="secondary" className="mt-1">
									Host
								</Badge>
							) : null}
							{player.disconnected ? (
								<Badge variant="secondary" className="mt-1">
									Disconnected
								</Badge>
							) : null}
						</div>
					</div>
				))}
			</div>
			<div className="absolute bottom-3 right-3">
				{isHost && !countdownStarted ? (
					<Button onClick={handleStartCountdown}>Start Match</Button>
				) : null}
			</div>
		</Card>
	);
}
