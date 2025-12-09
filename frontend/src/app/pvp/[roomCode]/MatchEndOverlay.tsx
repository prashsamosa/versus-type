import type { LobbyInfo } from "@versus-type/shared";
import { useSmallScreen } from "@/app/hooks/useSmallScreen";
import { Badge } from "@/components/ui/badge";
import { OrdinalBadge } from "@/components/ui/ordinal-badge";

export function MatchEndOverlay({ players }: { players: LobbyInfo }) {
	const finishedPlayers = Object.entries(players)
		.filter(([, p]) => p.finished && p.ordinal != null)
		.sort((a, b) => (a[1].ordinal ?? 99) - (b[1].ordinal ?? 99));

	const podium = finishedPlayers.filter(([, p]) => (p.ordinal ?? 99) <= 3);
	const rest = finishedPlayers.filter(
		([, p]) => (p.ordinal ?? 99) > 3 && (p.ordinal ?? 99 < 6),
	);
	const smallScreen = useSmallScreen();

	return (
		<div className="absolute inset-0 top-10 z-10 backdrop-blur-xs bg-background/60 flex flex-col items-center justify-center gap-6 rounded-md">
			<div className="flex items-end justify-center gap-8">
				{podium.map(([odinalUserId, player]) => (
					<div key={odinalUserId} className="flex flex-col items-center gap-2">
						<div className="opacity-80">
							<OrdinalBadge ordinal={player.ordinal ?? 0} large />
						</div>
						<span
							className={
								"font-semibold max-w-[150px] truncate " +
								(smallScreen ? "text-xl" : "text-3xl")
							}
							style={{ color: player.color }}
						>
							{player.username}
						</span>
						<Badge variant="outline" className="text-md items-center">
							{Math.round(player.wpm ?? 0)}{" "}
							<span className="text-muted-foreground">WPM</span>
							<div className="w-[2px] h-3 bg-input inline-block" />
							{Math.round(player.accuracy ?? 0)}
							<span className="text-muted-foreground -ml-1">%</span>
						</Badge>
					</div>
				))}
			</div>
			{rest.length > 0 && (
				<div className="flex flex-wrap items-center justify-center gap-4 mt-2">
					{rest.map(([odinalUserId, player]) => (
						<div
							key={odinalUserId}
							className="flex items-center gap-2 text-sm text-muted-foreground"
						>
							<OrdinalBadge ordinal={player.ordinal ?? 0} />
							<span style={{ color: player.color }}>{player.username}</span>
							<span className="opacity-60">
								{Math.round(player.wpm ?? 0)} WPM
							</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
