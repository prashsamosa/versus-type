"use client";
import { Activity, Check, Copy, WifiOff } from "lucide-react";
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
		loading,
		socketError,
		username,
		setUsername,
		isPending,
		roomCode,
		latency,
		disconnected,
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
		console.log("Copying match link for code:", roomCode);
		const url = `${window.location.origin}/pvp/${roomCode}`;
		navigator.clipboard.writeText(url);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div className="flex flex-col items-center justify-start min-h-screen">
			<div className="p-2 flex justify-between items-center w-full mb-4">
				<CodeCopy
					roomCode={roomCode}
					copied={copied}
					copyMatchLink={copyMatchLink}
				/>
				{disconnected ? (
					<Badge
						variant="outline"
						className="text-destructive text-sm shadow-destructive/15 shadow-md"
					>
						<WifiOff /> Disconnected
					</Badge>
				) : (
					<LatencyStatus latency={latency} />
				)}
			</div>
			<div className="flex flex-col justify-center items-center h-full w-full">
				<div className="p-16">
					<PvpGame />
				</div>
				<div className="flex gap-4 p-4 w-full absolute bottom-0 left-0">
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

function CodeCopy({
	roomCode,
	copied,
	copyMatchLink,
}: {
	roomCode: string;
	copied: boolean;
	copyMatchLink: () => void;
}) {
	return (
		<div className="p-2 rounded-md border flex justify-center items-center gap-2">
			<h1 className="font-bold">Code: {roomCode}</h1>
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
	);
}

function LatencyStatus({ latency }: { latency: number | null }) {
	if (!latency) return null;
	if (latency < 300) {
		return (
			<Badge variant="outline">
				<Activity className="size-4" />
				<span className="text-sm">{latency}ms</span>
			</Badge>
		);
	}
	if (latency < 700) {
		return (
			<Badge variant="outline">
				<Activity className="size-4" />
				<span className="text-sm text-orange-300">{latency}ms</span>
			</Badge>
		);
	}
	return (
		<Badge variant="outline">
			<Activity className="size-4" />
			<span className="text-sm text-destructive">{latency}ms</span>
		</Badge>
	);
}
