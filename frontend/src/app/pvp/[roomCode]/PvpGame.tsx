import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Passage from "./Passage";
import { PassageConfigPanel } from "./PassageConfigPanel";
import { usePvpStore } from "./store";

function fireConfetti() {
	confetti({
		angle: 60,
		spread: 55,
		origin: { x: 0, y: 0.6 },
	});
	confetti({
		angle: 120,
		spread: 55,
		origin: { x: 1, y: 0.6 },
	});
}

export function PvpGame() {
	const passage = usePvpStore((s) => s.passage);
	const matchStarted = usePvpStore((s) => s.matchStarted);
	const countdown = usePvpStore((s) => s.countdown);
	const countingDown = usePvpStore((s) => s.countingDown);
	const userId = authClient.useSession()?.data?.user?.id;
	const players = usePvpStore((s) => s.players);
	const isSpectating = players[userId || ""]?.spectator;
	const handleCountdownTick = usePvpStore((s) => s.handleCountdownTick);
	const enableConfetti = usePvpStore((s) => s.gameConfig.enableConfetti);
	const hasConfettiFired = useRef(false);

	const myPlayer = players[userId || ""];
	const isWinner = myPlayer?.finished && myPlayer?.ordinal === 1;

	useEffect(() => {
		if (isWinner && !hasConfettiFired.current && enableConfetti) {
			hasConfettiFired.current = true;
			fireConfetti();
		}
	}, [isWinner, enableConfetti]);

	useEffect(() => {
		if (!matchStarted) {
			hasConfettiFired.current = false;
		}
	}, [matchStarted]);

	useEffect(() => {
		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:countdown": (num) => {
				handleCountdownTick(num);
			},
		});
		return unregister;
	}, [socket, handleCountdownTick]);

	if (!passage) {
		return (
			<div className="border rounded-md p-4 mb-4 h-[40vh] w-[70vw] flex items-center justify-center">
				<p className="text-center text-gray-500">Loading...</p>
			</div>
		);
	}

	return (
		<div className="relative pt-18 px-10">
			<PassageConfigPanel />
			<Passage
				words={passage.split(" ")}
				disabled={!matchStarted}
				inputDisabled={isSpectating}
			/>
			{countingDown && (
				<div
					key={countdown}
					className="absolute top-[55%] left-1/2 font-bold animate-countdown text-foreground/95 text-shadow-[-0.5px_-0.5px_7px_var(--passage),0.5px_-0.5px_7px_var(--passage),-0.5px_0.5px_7px_var(--passage),0.5px_0.5px_7px_var(--passage)]"
				>
					{countdown}
				</div>
			)}
		</div>
	);
}
