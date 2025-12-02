"use client";

import { Globe, LogIn, Settings, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrowseModal } from "./browse-modal";
import { HostModal } from "./host-modal";
import { JoinModal } from "./join-modal";
import { LogoutButton } from "./logoutButton";
import { QuickPlayButton } from "./quick-play";

export default function Home() {
	const [hostOpen, setHostOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);
	const [browseOpen, setBrowseOpen] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="text-center space-y-8">
				<h1 className="text-4xl font-bold tracking-tight">Versus Type</h1>

				<div className="flex flex-col gap-3 w-64 mx-auto">
					<QuickPlayButton />
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
