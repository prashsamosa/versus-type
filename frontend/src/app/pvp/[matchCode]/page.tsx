"use client";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";
import Chat from "./Chat";
import { PvpGame } from "./PvpGame";
import SocketErrorPage from "./SocketErrorPage";
import { UsernameInput } from "./UsernameInput";

export default function PvpPage() {
	const { matchCode } = useParams<{ matchCode: string }>();
	const isHostFromParams = useSearchParams().get("isHost") === "true";
	const [isHost, setIsHost] = useState(isHostFromParams);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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
	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="font-bold mb-4">Match Code: {matchCode}</h1>
			<p className="text-lg mb-8">
				{isHost ? "You are the host" : "You are a participant"}
			</p>
			<div className="flex flex-col justify-center items-center gap-4 h-full w-full">
				<PvpGame />
				<div className="flex gap-4 p-4 w-full">
					<div className="w-[50vw] border" />
					<div className="flex-1 min-h-[30vh] max-h-[30vh]">
						<Chat />
					</div>
				</div>
			</div>
		</div>
	);
}
