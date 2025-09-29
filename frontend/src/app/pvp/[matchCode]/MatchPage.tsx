"use client";
import { useEffect, useState } from "react";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";
import Chat from "./Chat";
import { UsernameInput } from "./UsernameInput";

export function MatchPage({
	isHost,
	matchCode,
}: {
	isHost: boolean;
	matchCode: string;
}) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [username, setUsername] = useState("");

	useEffect(() => {
		if (!username) return;
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
		return disconnectSocket;
	}, [username]);

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
		return (
			<div className="flex flex-col items-center justify-center min-h-screen py-2">
				<h1 className="text-4xl font-bold mb-4">Error</h1>
				<p className="text-destructive">{error}</p>
			</div>
		);
	}
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-2">
			<h1 className="text-4xl font-bold mb-4">Match Code: {matchCode}</h1>
			<p className="text-lg mb-8">
				{isHost ? "You are the host" : "You are a participant"}
			</p>
			<Chat />
		</div>
	);
}
