"use client";

import { Globe, LogIn, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { BrowseModal } from "./browse-modal";
import { HostModal } from "./host-modal";
import { JoinModal } from "./join-modal";
import { LogoutButton } from "./logoutButton";
import { QuickPlayButton } from "./quick-play";

export default function Home() {
	const [hostOpen, setHostOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);
	const [browseOpen, setBrowseOpen] = useState(false);
	const user = authClient.useSession().data?.user;
	const isGuest = !user || user.isAnonymous;

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="text-center space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="space-y-1">
					<div className="flex justify-center items-center gap-6">
						<img src="./icon.svg" alt="Logo" className="size-28" />
						<h1 className="md:text-7xl text-5xl font-bold tracking-tight text-nowrap">
							<span className="bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
								Versus{" "}
							</span>
							<span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground/80 to-foreground/60">
								Type
							</span>
						</h1>
					</div>
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

				<div className="flex gap-3 justify-center flex-wrap mt-4 pt-4 px-4 bg-gradient-to-b from-card to-40% to-background border-t-2">
					<Button variant="ghost" size="sm" asChild>
						<Link href="/profile">
							<User className="size-4" />
							Profile
						</Link>
					</Button>
					{isGuest ? (
						<>
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
						</>
					) : null}
					<LogoutButton />
					<Button variant="ghost" size="sm" asChild>
						<a
							href="https://github.com/sahaj-b/versus-type"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								className="size-4"
								viewBox="0 0 98 96"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
									fill="currentColor"
								/>
							</svg>
							GitHub
						</a>
					</Button>
				</div>
			</div>

			<HostModal open={hostOpen} onOpenChange={setHostOpen} />
			<JoinModal open={joinOpen} onOpenChange={setJoinOpen} />
			<BrowseModal open={browseOpen} onOpenChange={setBrowseOpen} />
		</div>
	);
}
