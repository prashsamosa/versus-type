import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Passage from "./Passage";
import { usePvpStore } from "./store";

export function PvpGame() {
	const [passage, setPassage] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const matchStarted = usePvpStore((s) => s.matchStarted);
	const countdown = usePvpStore((s) => s.countdown);
	const countingDown = usePvpStore((s) => s.countingDown);
	const handleCountdownTick = usePvpStore((s) => s.handleCountdownTick);
	const setPassageLength = usePvpStore((s) => s.setPassageLength);
	const [passageConfig, setPassageConfig] = useState<GeneratorConfig | null>(
		null,
	);
	function fetchPassage() {
		if (!socket) return;
		setLoading(true);
		socket
			.emitWithAck("pvp:get-passage")
			.then((data) => {
				const { passage: receivedPassage, config } = data;
				setPassage(receivedPassage);
				setPassageLength(receivedPassage.length);
				setPassageConfig(config);
				setLoading(false);
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
		if (countingDown) fetchPassage();
	}, [countingDown]);

	if (loading) {
		return (
			<div className="border rounded p-4 mb-4 h-[50vh] w-[70vw] flex items-center justify-center">
				<p className="text-center text-gray-500">Loading...</p>
			</div>
		);
	}

	return (
		<div className="relative pt-12">
			{passageConfig && !countingDown ? (
				<div className="absolute top-10 left-3 z-10 flex justify-start items-center">
					<Badge variant="outline" className="text-muted-foreground text-sm">
						{/* TODO: passageConfig should include this */}
						English-200
					</Badge>
					<Badge variant="outline" className="text-muted-foreground text-sm">
						{passageConfig?.wordCount} Words
					</Badge>
					{passageConfig?.punctuation ? (
						<Badge variant="outline" className="text-muted-foreground text-sm">
							Punctuation
						</Badge>
					) : null}
					{passageConfig?.numbers ? (
						<Badge variant="outline" className="text-muted-foreground text-sm">
							Numbers
						</Badge>
					) : null}
				</div>
			) : null}
			<Passage words={passage.split(" ")} disabled={!matchStarted} />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
				{countingDown ? (
					<div className="text-white flex items-center justify-center text-5xl font-bold">
						{countdown}
					</div>
				) : null}
			</div>
		</div>
	);
}
