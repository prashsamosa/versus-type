import { ChevronLeft, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UsernameForm } from "../pvp/[roomCode]/UsernameForm";
import { GuestMessage } from "./guest";
import { MatchHistoryView } from "./match-history-view";
import { StatsView } from "./stats";

export const dynamic = "force-dynamic";

function StatsSkeleton() {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			<div className="col-span-2 row-span-2 h-[22rem] rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-full rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-full rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-full rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-full rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-full rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-full rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-44 rounded-xl bg-muted/50 animate-pulse" />
			<div className="h-44 rounded-xl bg-muted/50 animate-pulse" />
		</div>
	);
}

function MatchHistorySkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2">
				<div className="size-5 rounded bg-muted/50 animate-pulse" />
				<div className="h-6 w-48 rounded bg-muted/50 animate-pulse" />
			</div>
			<div className="rounded-xl border bg-card p-2">
				{[...Array(5)].map((_, i) => (
					<div key={i} className="flex items-center justify-between py-3 px-4">
						<div className="flex items-center gap-6">
							<div className="h-5 w-12 rounded bg-muted/50 animate-pulse" />
							<div className="h-5 w-20 rounded bg-muted/50 animate-pulse" />
							<div className="h-5 w-16 rounded bg-muted/50 animate-pulse" />
						</div>
						<div className="h-4 w-16 rounded bg-muted/50 animate-pulse" />
					</div>
				))}
			</div>
		</div>
	);
}

export default function ProfilePage() {
	return (
		<div className="container max-w-6xl mx-auto py-12 px-4">
			<div className="space-y-10">
				<Button variant="ghost" asChild className="-ml-2">
					<Link href="/">
						<ChevronLeft className="size-4" />
						Home
					</Link>
				</Button>

				<div className="flex items-center justify-center gap-4">
					<div className="p-4 relative rounded-full bg-primary/10">
						<User className="size-12 text-primary" />
						<div className="absolute">
							<GuestMessage />
						</div>
					</div>
					<UsernameForm />
				</div>

				<div className="max-w-md mx-auto w-full"></div>

				<Separator />

				<div className="space-y-6">
					<Suspense fallback={<StatsSkeleton />}>
						<StatsView />
					</Suspense>
				</div>

				<Suspense fallback={<MatchHistorySkeleton />}>
					<MatchHistoryView />
				</Suspense>
			</div>
		</div>
	);
}
