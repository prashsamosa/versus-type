import type { LobbyInfo } from "@versus-type/shared/index";
import { useEffect, useState } from "react";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Passage from "./Passage";

export function PvpGame({
	players,
	gameStarted,
	setGameStarted,
	initialIndex,
}: {
	players: LobbyInfo;
	gameStarted: boolean;
	setGameStarted: (started: boolean) => void;
	initialIndex: number;
}) {
	const [passage, setPassage] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [countdown, setCountdown] = useState<number | null>(null);

	if (!gameStarted && countdown === 0) {
		setGameStarted(true);
	}

	useEffect(() => {
		if (!socket) return;
		socket.emitWithAck("pvp:get-passage").then((receivedPassage) => {
			setPassage(receivedPassage);
			setLoading(false);
		});
		const unregister = registerSocketHandlers(socket, {
			"pvp:countdown": (num) => {
				setCountdown(num);
			},
		});
		return unregister;
	}, [socket]);
	if (loading) {
		return (
			<div className="border rounded p-4 mb-4 h-[50vh] w-[70vw] flex items-center justify-center">
				<p className="text-center text-gray-500">Loading...</p>
			</div>
		);
	}
	return (
		<div className="relative">
			<Passage
				words={passage.split(" ")}
				disabled={!gameStarted}
				players={players}
				initialIndex={initialIndex}
			/>
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				{!gameStarted ? (
					<div className="text-white flex items-center justify-center text-5xl font-bold">
						{countdown}
					</div>
				) : null}
			</div>
		</div>
	);
}
