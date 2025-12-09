"use client";

import type {
	MatchHistoryItem,
	MatchHistoryResponse,
} from "@versus-type/shared";
import { Gamepad2, Loader2, Swords, Target, Zap } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrdinalBadge } from "@/components/ui/ordinal-badge";
import { API_URL } from "@/const";

function formatDate(dateStr: string): string {
	const date = new Date(dateStr);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return "just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});
}

function MatchTypeBadge({ type }: { type: "solo" | "pvp" }) {
	return (
		<Badge
			variant="secondary"
			className={`text-xs ${type === "pvp" ? "bg-primary/20 text-primary" : "bg-muted"}`}
		>
			{type === "pvp" ? (
				<>
					<Swords className="size-3 mr-1" />
					PvP
				</>
			) : (
				<>
					<Gamepad2 className="size-3 mr-1" />
					Solo
				</>
			)}
		</Badge>
	);
}

function PassageConfigBadge({
	config,
}: {
	config: MatchHistoryItem["passageConfig"];
}) {
	const parts = [config.language, `${config.wordCount}w`];
	if (config.punctuation) parts.push("punct");
	if (config.numbers) parts.push("nums");

	return (
		<span className="text-xs text-muted-foreground hidden sm:inline">
			{parts.join(" · ")}
		</span>
	);
}

function MatchRow({ match }: { match: MatchHistoryItem }) {
	return (
		<div className="flex items-center justify-between py-3 px-4 hover:bg-muted/30 transition-colors rounded-lg gap-4">
			<div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
				<MatchTypeBadge type={match.type} />
				<div className="flex items-center gap-1.5 font-mono min-w-[70px]">
					<Zap className="size-4 text-primary" />
					<span className="font-semibold">
						{match.wpm !== null ? Math.round(match.wpm) : "-"}
					</span>
					<span className="text-muted-foreground text-sm hidden sm:inline">
						WPM
					</span>
				</div>
				<div className="flex items-center font-mono gap-1.5 min-w-[60px]">
					<Target className="size-4 text-muted-foreground" />
					<span className="font-medium">
						{match.accuracy !== null ? `${match.accuracy.toFixed(0)}%` : "-"}
					</span>
				</div>
				<PassageConfigBadge config={match.passageConfig} />
			</div>
			{match.type === "pvp" && <OrdinalBadge ordinal={match.ordinal} />}
			<span className="text-sm text-muted-foreground whitespace-nowrap">
				{formatDate(match.createdAt)}
			</span>
		</div>
	);
}

type MatchHistoryListProps = {
	initialData: MatchHistoryResponse;
};

export function MatchHistoryList({ initialData }: MatchHistoryListProps) {
	const [matches, setMatches] = useState<MatchHistoryItem[]>(
		initialData.matches,
	);
	const [hasMore, setHasMore] = useState(initialData.hasMore);
	const [loading, setLoading] = useState(false);

	async function loadMore() {
		setLoading(true);
		try {
			const res = await fetch(
				`${API_URL}/user/matches?limit=10&offset=${matches.length}`,
				{ credentials: "include" },
			);
			if (!res.ok) throw new Error("Failed to load matches");
			const data: MatchHistoryResponse = await res.json();
			setMatches((prev) => [...prev, ...data.matches]);
			setHasMore(data.hasMore);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	if (matches.length === 0) {
		return (
			<Card>
				<CardContent className="py-12 text-center">
					<Gamepad2 className="size-12 mx-auto text-muted-foreground/50 mb-4" />
					<p className="text-muted-foreground">No matches yet</p>
					<p className="text-sm text-muted-foreground/70 mt-1">
						Play some matches to see your history here
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			<Card>
				<CardContent className="p-2">
					<div className="divide-y divide-border/50">
						{matches.map((match) => (
							<MatchRow key={match.id} match={match} />
						))}
					</div>
				</CardContent>
			</Card>

			{hasMore && (
				<div className="flex justify-center">
					<Button
						variant="outline"
						onClick={loadMore}
						disabled={loading}
						className="min-w-[140px]"
					>
						{loading ? (
							<>
								<Loader2 className="size-4 animate-spin" />
								Loading...
							</>
						) : (
							"Load More"
						)}
					</Button>
				</div>
			)}
		</div>
	);
}
