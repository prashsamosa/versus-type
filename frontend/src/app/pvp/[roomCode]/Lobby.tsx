import { Crown, Eye, User, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
	SexyCard,
	SexyCardContent,
	SexyCardHeader,
} from "@/components/ui/sexy-card";
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
	const playerCnt = Object.values(players).filter(
		(player) => !player.disconnected,
	).length;
	return (
		<SexyCard>
			<SexyCardHeader>
				Lobby
				<div className="text-foreground/40">
					{playerCnt} {playerCnt === 1 ? "player" : "players"}
				</div>
			</SexyCardHeader>
			<SexyCardContent className="pt-3">
				{Object.entries(players).map(([userId, player]) => (
					<div key={userId} className="flex items-center gap-2">
						<div
							className={
								"flex gap-2 min-w-0 shrink-0 " +
								(matchStarted || matchEnded || countingDown
									? "w-[40%]"
									: "flex-1")
							}
						>
							<span
								className={`truncate ${userId === myUserId ? "font-bold" : ""} ${player.disconnected ? "line-through" : ""}`}
								style={{ color: player.color }}
							>
								{player.username}
							</span>
							{player.isHost ? (
								<Badge variant="secondary" className="shrink-0">
									<User className="-ml-0.5" />
									Host
								</Badge>
							) : null}
							{player.disconnected ? (
								<Badge variant="secondary" className="shrink-0">
									<WifiOff />
								</Badge>
							) : player.spectator ? (
								<Badge variant="secondary" className="shrink-0">
									<Eye />
								</Badge>
							) : null}
						</div>
						{player.spectator ? null : (
							<div
								className={
									"flex items-center flex-1 gap-0 transition ease-in-out duration-300 " +
									(countingDown || matchStarted || matchEnded
										? ""
										: "translate-x-[150%]")
								}
							>
								<div className="flex items-center gap-2 justify-end min-w-0 flex-1">
									{player.ordinal === 1 ? (
										<Crown className="text-yellow-400 size-4 shrink-0" />
									) : player.ordinal && player.ordinal > 1 ? (
										<Badge
											variant="secondary"
											className={
												"font-bold shrink-0 " +
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
										className="text-right text-nowrap text-md shrink-0"
									>
										{Math.round(wpms[userId] ?? 0)}{" "}
										<span className="opacity-50">WPM</span>
									</Badge>
									{player.finished ? (
										<Badge
											variant="outline"
											className="text-right text-nowrap text-md shrink-0"
										>
											{Math.round(player.accuracy ?? 0)}%{" "}
											<span className="opacity-50">Acc</span>
										</Badge>
									) : null}
								</div>
								<div
									className={
										"bg-muted ring ring-muted p-1 rounded h-4 overflow-hidden rounded-full transition-all ease-out shrink-0 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_-1px_3px_rgba(0,0,0,0.6)] " +
										(player.finished ? "w-0 ml-0" : "flex-3 min-w-[3rem] ml-2")
									}
								>
									<div
										className="h-2 bg-accent transition-all duration-100 rounded shadow-[inset_0_2px_2px_rgba(255,255,255,0.6),0_2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.1)] "
										style={{
											width: `${((oppTypingIndexes[userId] ?? player.typingIndex) / Math.max(1, passageLength)) * 100}%`,
											backgroundColor: player.color || "#666",
										}}
									/>
								</div>
							</div>
						)}
					</div>
				))}
			</SexyCardContent>
		</SexyCard>
	);
}
