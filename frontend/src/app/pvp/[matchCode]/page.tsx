"use client";
import { Activity, Check, Copy } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Chat from "./Chat";
import { usePvpSession } from "./hooks/usePvpSession";
import { Lobby } from "./Lobby";
import { PvpGame } from "./PvpGame";
import SocketErrorPage from "./SocketErrorPage";
import { UsernameInput } from "./UsernameInput";

export default function PvpPage() {
	const {
		isHost,
		loading,
		socketError,
		username,
		setUsername,
		isPending,
		matchCode,
		latency,
	} = usePvpSession();

	const [copied, setCopied] = useState(false);

	if (isPending) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen py-2">
				<h1 className="text-4xl font-bold mb-4">Loading...</h1>
			</div>
		);
	}

	if (!username) {
		return <UsernameInput setUsername={setUsername} />;
	}
	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen py-2">
				<h1 className="text-4xl font-bold mb-4">Connecting to match...</h1>
			</div>
		);
	}
	if (socketError) {
		return <SocketErrorPage message={socketError} />;
	}

	function copyMatchLink() {
		const url = `${window.location.origin}/pvp/${matchCode}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex flex-col items-center justify-start min-h-screen">
			<div className="px-2 flex justify-between items-center w-full mb-4">
				<div className="p-2 rounded-md border flex justify-center items-center gap-2">
					<h1 className="font-bold">Code: {matchCode}</h1>
					<Button
						variant="outline"
						size="sm"
						onClick={copyMatchLink}
						className="gap-2"
					>
						{copied ? (
							<>
								<Check className="size-4" />
								Copied!
							</>
						) : (
							<>
								<Copy className="size-4" />
								Copy Invite Link
							</>
						)}
					</Button>
				</div>

				{latency ? (
					<Badge variant="outline">
						<Activity className="size-4" />
						<span className="text-sm">{latency}ms</span>
					</Badge>
				) : null}
			</div>
			<div className="flex flex-col justify-center items-center gap-4 h-full w-full">
				<PvpGame />
				<div className="flex gap-4 p-4 w-full">
					<div className="flex-1 min-h-[30vh] max-h-[30vh]">
						<Lobby />
					</div>
					<div className="flex-1 min-h-[30vh] max-h-[30vh]">
						<Chat />
					</div>
				</div>
			</div>
		</div>
	);
}
