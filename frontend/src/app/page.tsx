"use client";

import {
	Globe,
	Loader2,
	LogIn,
	Settings,
	User,
	UserPlus,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getQuickPlayRoom } from "@/services/pvp.client";
import { BrowseModal } from "./browse-modal";
import { HostModal } from "./host-modal";
import { JoinModal } from "./join-modal";
import { LogoutButton } from "./logoutButton";

export default function Home() {
	const router = useRouter();
	const [hostOpen, setHostOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);
	const [browseOpen, setBrowseOpen] = useState(false);
	const [quickPlayLoading, setQuickPlayLoading] = useState(false);
	const [quickPlayError, setQuickPlayError] = useState<string | null>(null);

	async function handleQuickPlay() {
		setQuickPlayLoading(true);
		setQuickPlayError(null);
		try {
			const roomCode = await getQuickPlayRoom();
			router.push(`/pvp/${roomCode}`);
		} catch (err) {
			setQuickPlayError(
				err instanceof Error ? err.message : "Failed to find a match",
			);
		} finally {
			setQuickPlayLoading(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="text-center space-y-8">
				<h1 className="text-4xl font-bold tracking-tight">Versus Type</h1>

				<div className="flex flex-col gap-3 w-64 mx-auto">
					<Tooltip
						open={!!quickPlayError}
						onOpenChange={(open) => !open && setQuickPlayError(null)}
					>
						<TooltipTrigger asChild>
							<Button
								size="lg"
								onClick={handleQuickPlay}
								disabled={quickPlayLoading}
							>
								{quickPlayLoading ? (
									<Loader2 className="size-4 animate-spin" />
								) : (
									<Zap className="size-4" />
								)}
								Quick Play
							</Button>
						</TooltipTrigger>
						<TooltipContent className="text-destructive text-sm">
							{quickPlayError}
						</TooltipContent>
					</Tooltip>
					<Button size="lg" variant="secondary" asChild>
						<Link href="/solo">
							<User className="size-4" />
							Solo
						</Link>
					</Button>
					<div className="flex gap-3">
						<Button
							className="flex-1"
							size="lg"
							variant="outline"
							onClick={() => setHostOpen(true)}
						>
							Host
						</Button>
						<Button
							className="flex-1"
							size="lg"
							variant="outline"
							onClick={() => setJoinOpen(true)}
						>
							Join
						</Button>
					</div>
					<Button
						size="lg"
						variant="outline"
						onClick={() => setBrowseOpen(true)}
					>
						<Globe className="size-4" />
						Browse Rooms
					</Button>
				</div>

				<div className="flex gap-3 justify-center flex-wrap">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/profile">
							<User className="size-4" />
							Profile
						</Link>
					</Button>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/settings">
							<Settings className="size-4" />
							Settings
						</Link>
					</Button>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/sign-in">
							<LogIn className="size-4" />
							Sign In
						</Link>
					</Button>
					<Button variant="ghost" size="sm" asChild>
						<Link href="/sign-up">
							<UserPlus className="size-4" />
							Sign Up
						</Link>
					</Button>
					<LogoutButton />
				</div>
			</div>

			<HostModal open={hostOpen} onOpenChange={setHostOpen} />
			<JoinModal open={joinOpen} onOpenChange={setJoinOpen} />
			<BrowseModal open={browseOpen} onOpenChange={setBrowseOpen} />
		</div>
	);
}
