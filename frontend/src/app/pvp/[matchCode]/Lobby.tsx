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
						<div className="flex items-center justify-end flex-2">
							<div className="flex items-center gap-2 min-w-[80px] justify-end">
								<Crown
									className={`text-yellow-400 size-4 transition ease-in-out shrink-0 ${player.ordinal === 1 ? "" : "scale-0"}`}
								/>{" "}
								{player.ordinal && player.ordinal > 1 ? (
									<Badge
										variant="secondary"
										className={
											"mt-0.5 font-bold " +
											(player.ordinal === 2
												? "bg-gray-400 text-background"
												: player.ordinal === 3
													? "bg-orange-400/70 text-background"
													: "")
										}
									>
										{player.ordinal}
										{player.ordinal === 2
											? "nd"
											: player.ordinal === 3
												? "rd"
												: "th"}
									</Badge>
								) : null}
								<span className="text-right text-nowrap">
									{Math.round(wpms[userId] ?? 0)} WPM
								</span>
							</div>
							<div className="md:w-3xs w-[5rem] mx-4 bg-muted rounded h-2 overflow-hidden">
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
