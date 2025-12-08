import { ChevronLeft, User } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UsernameForm } from "../pvp/[roomCode]/UsernameForm";
import { GuestMessage } from "./guest";
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
			</div>
		</div>
	);
}
