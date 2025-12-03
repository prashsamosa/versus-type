"use client";
import {
	Activity,
	Check,
	ChevronDown,
	ChevronUp,
	Copy,
	Settings,
	WifiOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { QuickPlayButton } from "@/app/quick-play";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { Banner } from "./banner";
import Chat from "./Chat";
import { usePvpSession } from "./hooks/usePvpSession";
import { Lobby } from "./Lobby";
import { PvpGame } from "./PvpGame";
import SocketErrorPage from "./SocketErrorPage";
import { usePvpStore } from "./store";
import { UsernameForm } from "./UsernameForm";

export default function PvpPage() {
	const { data, isPending } = authClient.useSession();
	let username = data?.user.name.trim() || "";
	if (username === "Anonymous") username = "";
	const { loading, socketError, roomCode, latency, disconnected } =
		usePvpSession(!!username);

	const [copied, setCopied] = useState(false);

	const router = useRouter();
	const countingDown = usePvpStore((s) => s.countingDown);
	const setCountingDown = usePvpStore((s) => s.setCountingDown);
	const players = usePvpStore((s) => s.players);
	const matchStarted = usePvpStore((s) => s.matchStarted);
	const myUserId = authClient.useSession().data?.user.id;
	const isHost = players[myUserId || ""]?.isHost || false;
	const matchEnded = usePvpStore((s) => s.matchEnded);
	const initializeNextMatchState = usePvpStore(
		(s) => s.initializeNextMatchState,
	);
	const resetStore = usePvpStore((s) => s.resetStore);
	const config = usePvpStore((s) => s.config);
	const setConfig = usePvpStore((s) => s.setConfig);
	const [expanded, setExpanded] = useState(false);
	const roomType = usePvpStore((s) => s.roomType);
	const isSpectating = myUserId ? players[myUserId]?.spectator : false;
	const waitingCountdown = usePvpStore((s) => s.waitingCountdown);
	useEffect(() => {
		return () => {
			resetStore();
		};
	}, [resetStore]);

	const waitingForPlayers =
		roomType === "single-match" && !matchStarted && !matchEnded
			? Object.keys(players).length < 2 || !!waitingCountdown
			: false;

	if (!username && !isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<Card>
					<UsernameForm />
				</Card>
			</div>
		);
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

	async function handleStartCountdown() {
		if (matchEnded) initializeNextMatchState();
		const response = await socket?.emitWithAck("pvp:start-match");
		console.log("Start match response:", response);
		if (response?.success) {
			setCountingDown(true);
		}
	}

	function handleExit() {
		router.push("/");
	}

	return (
		<div className="flex flex-col items-center justify-start min-h-screen">
			<div className="w-full -z-10 absolute p-5 text-center font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-background from-30% to-90% hidden md:block md:text-4xl lg:text-5xl">
				{roomType === "single-match"
					? "Quick Play"
					: roomType === "public"
						? "Public Room"
						: "Private Room"}
			</div>
			<div className="p-2 px-4 flex justify-between items-center w-full mb-4">
				<CodeCopy
					roomCode={roomCode}
					copied={copied}
					copyMatchLink={copyMatchLink}
				/>
				<div className="flex items-center justify-center gap-2">
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
					<Dialog>
						<DialogTrigger asChild>
							<Button variant="outline" size="icon">
								<Settings className="size-4" />
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Game Settings</DialogTitle>
							</DialogHeader>
							<div className="flex items-center justify-between py-2">
								<Label htmlFor="show-opp-cursors">Show opponent cursors</Label>
								<Switch
									id="show-opp-cursors"
									checked={config.showOppCursors}
									onCheckedChange={(checked) =>
										setConfig({ ...config, showOppCursors: checked })
									}
								/>
							</div>
						</DialogContent>
					</Dialog>
					<Button variant="secondary" onClick={handleExit}>
						Exit
					</Button>
					{roomType !== "single-match" &&
					isHost &&
					!countingDown &&
					!matchStarted ? (
						<Button onClick={handleStartCountdown}>
							{matchEnded ? "Start Next Match" : "Start Match"}
						</Button>
					) : null}
				</div>
			</div>
			<div className="flex flex-col justify-center items-center h-full w-full">
				<div className="pt-16 relative">
					{players[myUserId ?? ""]?.finished && roomType === "single-match" ? (
						<div className="relative z-10 text-center -mb-10">
							<QuickPlayButton label="Find New Match" />
						</div>
					) : null}
					<div
						className={`text-center -mb-2 transition-all duration-400 ${isSpectating || waitingForPlayers ? "opacity-100" : "opacity-0"}`}
					>
						<Banner
							isSpectating={isSpectating}
							waitingForPlayers={waitingForPlayers}
						/>
					</div>
					<PvpGame />
				</div>
				<div
					className={
						"flex gap-4 p-4 w-full pt-9 absolute bottom-0 left-1/2 -translate-x-1/2 z-30 transition-all min-h-[290px] " +
						(expanded
							? "max-w-[1400px] h-[79vh] backdrop-blur-xs"
							: "max-w-7xl h-[30vh]")
					}
				>
					<button
						onClick={() => setExpanded(!expanded)}
						className={
							"cursor-pointer flex justify-center absolute left-1/2 top-0.5 -z-10 -translate-x-1/2 w-[90%] py-1.5 transition opacity-40 hover:opacity-100 rounded-b-none rounded-t-md backdrop-blur-xs bg-card/50 " +
							(expanded ? "" : "hover:bg-card/40")
						}
					>
						{expanded ? <ChevronDown /> : <ChevronUp />}
					</button>
					<div className={"flex-1 transition-all min-w-0"}>
						<Lobby />
					</div>
					<div className={"flex-1 transition-all "}>
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
	if (latency === null) return null;
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
