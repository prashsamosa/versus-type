import type { PlayerInfo } from "@versus-type/types";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";

export function Lobby() {
	const [players, setPlayers] = useState<PlayerInfo[]>([]);
	useEffect(() => {
		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:lobby-update": (data) => {
				setPlayers(data.players);
			},
		});
		return unregister;
	}, []);
	return (
		<Card className="h-full p-2 gap-2">
			<div className="border-b p-2 pb-3 flex justify-between items-center">
				Lobby <Badge>{players.length} players</Badge>
			</div>
			<div className="flex flex-col p-2 gap-2 overflow-y-auto">
				{players.map((player) => (
					<div key={player.socketId} className="flex items-center gap-2">
						<div className="flex gap-2">
							<span
								className={`mb-1 ${player.socketId === socket?.id ? "font-bold" : ""}`}
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
