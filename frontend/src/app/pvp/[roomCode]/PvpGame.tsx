import { useEffect, useState } from "react";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Passage from "./Passage";
import { usePvpStore } from "./store";

export function PvpGame() {
	const [passage, setPassage] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const gameStarted = usePvpStore((s) => s.gameStarted);
	const countdown = usePvpStore((s) => s.countdown);
	const countdownStarted = usePvpStore((s) => s.countdownStarted);
	const handleCountdownTick = usePvpStore((s) => s.handleCountdownTick);
	const setPassageLength = usePvpStore((s) => s.setPassageLength);
	function fetchPassage() {
		console.log("FETCH PASSAGE CALLED");
		if (!socket) return;
		console.log("FETCH PASSAGE CALLED");
		setLoading(true);
		socket
			.emitWithAck("pvp:get-passage")
			.then((receivedPassage) => {
				setPassage(receivedPassage);
				setPassageLength(receivedPassage.length);
				setLoading(false);
				console.log(receivedPassage);
			})
			.catch(() => {
				setLoading(false);
			});
	}

	useEffect(() => {
		if (!socket) return;
		fetchPassage();
		const unregister = registerSocketHandlers(socket, {
			"pvp:countdown": (num) => {
				handleCountdownTick(num);
			},
		});
		return unregister;
	}, [socket, handleCountdownTick, setPassageLength]);

	useEffect(() => {
		if (countdownStarted) fetchPassage();
	}, [countdownStarted]);

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
				disabled={countdown !== null || !gameStarted}
			/>
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				{countdown !== null ? (
					<div className="text-white flex items-center justify-center text-5xl font-bold">
						{countdown}
					</div>
				) : null}
			</div>
		</div>
	);
}
