"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { BrowseModal } from "./browse-modal";
import { HostModal } from "./host-modal";
import { JoinModal } from "./join-modal";
import { LogoutButton } from "./logoutButton";

export default function Home() {
	const [hostOpen, setHostOpen] = useState(false);
	const [joinOpen, setJoinOpen] = useState(false);
	const [browseOpen, setBrowseOpen] = useState(false);

	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="container max-w-4xl mx-auto">
				<div className="text-center space-y-8">
					<div className="space-y-4">
						<h1 className="text-4xl font-bold tracking-tight">Versus Type</h1>
						<p className="text-xl text-muted-foreground">
							Test your typing skills in fast-paced battles
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Quick Start</CardTitle>
							</CardHeader>
							<CardContent>
								<Button className="w-full" size="lg" asChild>
									<Link href="/solo">Solo</Link>
								</Button>
								<Button
									className="w-full mt-2"
									size="lg"
									variant="secondary"
									onClick={() => setHostOpen(true)}
								>
									Host
								</Button>
								<Button
									className="w-full mt-2"
									size="lg"
									variant="outline"
									onClick={() => setJoinOpen(true)}
								>
									Join
								</Button>
								<Button
									className="w-full mt-2"
									size="lg"
									variant="ghost"
									onClick={() => setBrowseOpen(true)}
								>
									Browse Rooms
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Profile</CardTitle>
								<CardDescription>View your stats and progress</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full" size="lg" asChild>
									<Link href="/profile">View Profile</Link>
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Settings</CardTitle>
								<CardDescription>Customize your experience</CardDescription>
							</CardHeader>
							<CardContent>
								<Button variant="outline" className="w-full" size="lg" asChild>
									<Link href="/settings">Settings</Link>
								</Button>
							</CardContent>
						</Card>
					</div>

					<div className="flex gap-4 justify-center flex-wrap">
						<Button variant="outline" asChild>
							<Link href="/sign-in">Sign In</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/sign-up">Sign Up</Link>
						</Button>
						<LogoutButton />
					</div>
				</div>
			</div>

			<HostModal open={hostOpen} onOpenChange={setHostOpen} />
			<JoinModal open={joinOpen} onOpenChange={setJoinOpen} />
			<BrowseModal open={browseOpen} onOpenChange={setBrowseOpen} />
		</div>
	);
}
