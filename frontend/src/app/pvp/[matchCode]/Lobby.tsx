import { Crown, WifiOff } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { usePvpStore } from "./store";

export function Lobby() {
	const [countdownStarted, setCountdownStarted] = useState(false);
	const players = usePvpStore((s) => s.players);
	const wpms = usePvpStore((s) => s.wpms);
	const oppTypingIndexes = usePvpStore((s) => s.oppTypingIndexes);
	const passageLength = usePvpStore((s) => s.passageLength);
	const myUserId = authClient.useSession().data?.user.id;
	const isHost = players[myUserId || ""]?.isHost || false;

	console.log("Current WPMs in store:", wpms);

	async function handleStartCountdown() {
		const response = await socket?.emitWithAck("pvp:start-match");
		if (response?.success) setCountdownStarted(true);
	}

	return (
		<Card className="h-full p-2 gap-2 relative">
			<div className="border-b p-2 pb-3 flex justify-between items-center">
				Lobby <Badge>{Object.keys(players).length} players</Badge>
			</div>
			<div className="flex flex-col p-2 gap-2 overflow-y-auto">
				{Object.entries(players).map(([userId, player]) => (
					<div key={userId} className="flex justify-between items-center gap-1">
						<div className="flex items-center gap-2 flex-1">
							<div className="flex gap-2">
								<span
									className={`${userId === myUserId ? "font-bold" : ""} ${player.disconnected ? "line-through" : ""}`}
									style={{ color: player.color }}
								>
									{player.username}{" "}
								</span>
								{player.isHost ? (
									<Badge variant="secondary" className="mt-0.5">
										Host
									</Badge>
								) : null}
								{player.disconnected ? (
									<Badge variant="secondary" className="mt-0.5">
										<WifiOff />
									</Badge>
								) : null}
							</div>
						</div>
						<div className="flex items-center gap-2 justify-end flex-2">
							<Crown
								className={`text-yellow-400 size-4 transition ease-in-out shrink-0 ${player.winner ? "" : "scale-0"}`}
							/>{" "}
							<span className="text-right text-nowrap">
								{Math.round(wpms[userId] ?? 0)} WPM
							</span>
							<div className="w-full max-w-2xs mx-4 bg-muted rounded h-2">
								<div
									className="h-full bg-accent transition-all duration-100 rounded"
									style={{
										width: `calc(${((oppTypingIndexes[userId] ?? player.typingIndex) / Math.max(1, passageLength)) * 100}%)`,
										backgroundColor: player.color || "#666",
									}}
								/>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="absolute bottom-4 right-4">
				{isHost && !countdownStarted ? (
					<Button onClick={handleStartCountdown}>Start Match</Button>
				) : null}
			</div>
		</Card>
	);
}
