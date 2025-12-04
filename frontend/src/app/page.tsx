"use client";

import { Globe, Keyboard, LogIn, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
			<div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="space-y-3">
					<div className="flex justify-center">
						<div className="p-3 rounded-xl bg-primary/10 ring-1 ring-primary/20">
							<Keyboard className="size-8 text-primary" />
						</div>
					</div>
					<h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
						Versus Type
					</h1>
					<p className="text-muted-foreground">
						Race your friends. Prove you're the fastest.
					</p>
				</div>

				<div className="flex flex-col gap-3 w-64 mx-auto">
					<QuickPlayButton />
					<Button size="lg" variant="secondary" asChild>
						<Link href="/solo">
							<User className="size-4" />
							Solo Practice
						</Link>
					</Button>
					<Button
						size="lg"
						variant="secondary"
						onClick={() => setBrowseOpen(true)}
					>
						<Globe className="size-4" />
						Browse Rooms
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
				</div>

				<Separator className="w-32 mx-auto" />

				<div className="flex gap-3 justify-center flex-wrap">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/profile">
							<User className="size-4" />
							Profile
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
