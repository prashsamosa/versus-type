import { Crown, Eye, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { usePvpStore } from "./store";

export function Lobby() {
	const players = usePvpStore((s) => s.players);
	const wpms = usePvpStore((s) => s.wpms);
	const oppTypingIndexes = usePvpStore((s) => s.oppTypingIndexes);
	const passageLength = usePvpStore((s) => s.passageLength);
	const matchStarted = usePvpStore((s) => s.matchStarted);
	const myUserId = authClient.useSession().data?.user.id;
	const matchEnded = usePvpStore((s) => s.matchEnded);
	const countingDown = usePvpStore((s) => s.countingDown);

	return (
		<Card className="h-full p-2 gap-2 relative">
			<div className="border-b p-2 pb-3 flex justify-between items-center">
				<div className="flex items-center gap-2 font-bold text-lg">Lobby</div>
				<Badge>
					{Object.keys(players).length}{" "}
					{Object.keys(players).length === 1 ? "player" : "players"}
				</Badge>
			</div>
			<div className="flex flex-col p-2 gap-2 overflow-y-auto overflow-x-hidden">
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
								) : player.spectator ? (
									<Badge variant="secondary" className="mt-0.5">
										<Eye />
									</Badge>
								) : null}
							</div>
						</div>
						{player.spectator || player.disconnected ? null : (
							<div
								className={
									"flex items-center justify-end flex-2 transition duration-300 ease-in-out " +
									(countingDown || matchStarted || matchEnded
										? player.finished
											? "md:translate-x-[calc(var(--container-3xs)+_2rem)] translate-x-[calc(5rem+_2rem)]"
											: ""
										: "translate-x-full")
								}
							>
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
									<Badge
										variant="outline"
										className="text-right text-nowrap text-md"
									>
										{Math.round(wpms[userId] ?? 0)}{" "}
										<span className="opacity-50">WPM</span>
									</Badge>
									{player.finished ? (
										<Badge
											variant="outline"
											className="text-right text-nowrap text-md"
										>
											{Math.round(player.accuracy ?? 0)}%{" "}
											<span className="opacity-50">Acc</span>
										</Badge>
									) : null}
								</div>
								<div className="md:w-3xs w-[5rem] mx-4 bg-muted rounded h-2 overflow-hidden ">
									<div
										className="h-full bg-accent transition-all duration-100 rounded"
										style={{
											width: `calc(${((oppTypingIndexes[userId] ?? player.typingIndex) / Math.max(1, passageLength)) * 100}%)`,
											backgroundColor: player.color || "#666",
										}}
									/>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</Card>
	);
}
