"use client";
import { Check, Copy } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";
import Chat from "./Chat";
import { Lobby } from "./Lobby";
import { PvpGame } from "./PvpGame";
import SocketErrorPage from "./SocketErrorPage";
import { UsernameInput } from "./UsernameInput";

export default function PvpPage() {
	const { matchCode } = useParams<{ matchCode: string }>();
	const isHostFromParams = useSearchParams().get("isHost") === "true";
	const [isHost, setIsHost] = useState(isHostFromParams);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const [username, setUsername] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("anonymousUsername") || "";
		}
		return "";
	});
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (session?.user && !session?.user.isAnonymous) {
			const displayName =
				session.user.name ?? session.user.email?.split("@")[0] ?? "User";
			setUsername(displayName);
		} else if (!session?.user.isAnonymous) {
			authClient.signIn.anonymous();
		}
	}, [session]);

	useEffect(() => {
		if (!username || isPending) return;
		setupSocketAndJoin(username, matchCode, isHost)
			.then((response) => {
				setLoading(false);
				if (!response.success) {
					setError(response.message);
				}
			})
			.catch((err) => {
				setLoading(false);
				setError(`Failed to connect to server: ${err.message}`);
			});

		// TODO: move it somewhere else
		function handleNewHost(data: { socketId: string }) {
			if (socket && data.socketId === socket.id) {
				setIsHost(true);
			}
		}
		socket?.on("pvp:new-host", handleNewHost);
		return () => {
			disconnectSocket();
			socket?.off("pvp:new-host", handleNewHost);
		};
	}, [username, isPending]);

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
	if (error) {
		return <SocketErrorPage message={error} />;
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
				{isHost ? (
					<Badge>Host</Badge>
				) : (
					<Badge variant="secondary">Participant</Badge>
				)}
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
