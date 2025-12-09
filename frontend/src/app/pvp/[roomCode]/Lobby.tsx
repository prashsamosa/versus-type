import { Crown, Eye, MessageCircleMore, User, WifiOff } from "lucide-react";
import { LazyMotion, m } from "motion/react";
import { useSmallScreen } from "@/app/hooks/useSmallScreen";
import { Badge } from "@/components/ui/badge";
import { BadgeToggle } from "@/components/ui/badge-toggle";
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
	const roomType = usePvpStore((s) => s.roomType);
	const isHost = myUserId ? players[myUserId]?.isHost : false;
	const toggleSidebar = usePvpStore((s) => s.toggleSidebar);
	const smallScreen = useSmallScreen();
	const sortingEnabled = usePvpStore((s) => s.gameConfig.enableSorting);
	const setGameConfig = usePvpStore((s) => s.setGameConfig);

	const playerCnt = Object.values(players).filter(
		(player) => !player.disconnected,
	).length;

	const status =
		matchStarted || countingDown || (isHost && roomType !== "matchmaking")
			? ""
			: !matchEnded
				? null
				: roomType !== "matchmaking"
					? "Host will start"
					: null;

	let sortedPlayers: [string, (typeof players)[string]][];

	if (!sortingEnabled) {
		sortedPlayers = Object.entries(players);
	} else {
		sortedPlayers = Object.entries(players).sort(([aid, a], [bid, b]) => {
			// disconnected >>>>
			if (a.disconnected && !b.disconnected) return 1;
			if (!a.disconnected && b.disconnected) return -1;

			// spectators >>>>
			if (a.spectator && !b.spectator) return 1;
			if (!a.spectator && b.spectator) return -1;

			// unfinished > finished
			if (a.finished && !b.finished) return -1;
			if (!a.finished && b.finished) return 1;

			// finished, sort by ordinal
			if (a.finished && b.finished) {
				return (a.ordinal || Infinity) - (b.ordinal || Infinity);
			}

			// unfinished, sort by typing index
			const aIndex = oppTypingIndexes[aid] ?? a.typingIndex;
			const bIndex = oppTypingIndexes[bid] ?? b.typingIndex;
			return bIndex - aIndex;
		});
	}

	return (
		<SexyCard>
			<SexyCardHeader>
				<div className="flex gap-3 items-center">
					<span>Lobby</span>

					{smallScreen ? (
						<button
							className="flex items-center gap-1"
							onClick={() => toggleSidebar()}
						>
							<MessageCircleMore className="size-4 mt-0.5" />
							Open Chat
						</button>
					) : status ? (
						<span className="text-foreground/40 font-medium"> {status} </span>
					) : null}
				</div>
				<div className="flex items-center gap-3">
					<span className="text-muted-foreground hidden sm:inline">
						{playerCnt} {playerCnt === 1 ? "player" : "players"}
					</span>
					<div className="w-12" />
					<BadgeToggle
						enabled={sortingEnabled}
						onToggle={() => {
							setGameConfig({
								...usePvpStore.getState().gameConfig,
								enableSorting: !sortingEnabled,
							});
						}}
						className="border-l inset-ring-0 absolute top-1 right-1 rounded-none rounded-tr-lg"
					>
						Sort
					</BadgeToggle>
				</div>
			</SexyCardHeader>
			<SexyCardContent className="pt-3">
				<LazyMotion
					features={() => import("./features").then((res) => res.default)}
				>
					{sortedPlayers.map(([userId, player]) => (
						<m.div
							key={userId}
							layout
							transition={{ type: "spring", stiffness: 500, damping: 35 }}
							className="flex items-center gap-2"
						>
							<div
								className={
									"flex gap-2 min-w-0 shrink-0 " +
									(matchStarted || matchEnded || countingDown
										? "w-[40%]"
										: "flex-1")
								}
							>
								<span
									className={`truncate ${userId === myUserId ? "font-bold" : ""} ${player.disconnected ? "line-through" : ""} ${smallScreen ? "text-sm" : "text-md"}`}
									style={{ color: player.color }}
								>
									{player.username}
								</span>
								{player.isHost ? (
									<Badge variant="secondary" className="shrink-0">
										{smallScreen ? null : <User className="-ml-0.5" />}
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
										((countingDown || matchStarted || matchEnded) &&
										!player.spectator &&
										!(!player.finished && matchEnded && !player.disconnected) // matchEnd & !player.finished means a new/reconecter joined while match is ended
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
											className={
												"text-right text-nowrap shrink-0 " +
												(smallScreen ? "text-sm" : "text-md")
											}
										>
											{Math.round(wpms[userId] ?? 0)}{" "}
											<span className="opacity-50 ">WPM</span>
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
											"bg-muted ring ring-muted p-1 h-4 overflow-hidden rounded-full transition-all ease-out shrink-0 shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_-1px_3px_rgba(0,0,0,0.6)] " +
											(player.finished
												? "w-0 -ml-4 translate-x-8"
												: "flex-3 min-w-[3rem] ml-2")
										}
									>
										<div
											className="h-2 bg-accent transition-all duration-100 rounded shadow-[inset_0_2px_2px_rgba(255,255,255,0.5),0_2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.1)] "
											style={{
												width: `${((oppTypingIndexes[userId] ?? player.typingIndex) / Math.max(1, passageLength)) * 100}%`,
												backgroundColor: player.color || "#666",
											}}
										/>
									</div>
								</div>
							)}
						</m.div>
					))}
				</LazyMotion>
			</SexyCardContent>
		</SexyCard>
	);
}
