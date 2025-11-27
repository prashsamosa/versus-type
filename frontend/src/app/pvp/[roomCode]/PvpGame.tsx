import {
	type GeneratorConfig,
	languageOptions,
} from "@versus-type/shared/passage-generator";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BadgeToggle } from "@/components/ui/badge-toggle";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import Passage from "./Passage";
import { usePvpStore } from "./store";

const WORD_COUNT_OPTIONS = [10, 25, 50, 75, 100, 150, 200, 250, 300, 500];

export function PvpGame() {
	const [passage, setPassage] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const matchStarted = usePvpStore((s) => s.matchStarted);
	const countdown = usePvpStore((s) => s.countdown);
	const countingDown = usePvpStore((s) => s.countingDown);
	const userId = authClient.useSession()?.data?.user?.id;
	const players = usePvpStore((s) => s.players);
	const isHost = userId ? players[userId]?.isHost || false : false;
	const isSpectating = usePvpStore((s) => s.players[userId || ""]?.spectator);
	const handleCountdownTick = usePvpStore((s) => s.handleCountdownTick);
	const setPassageLength = usePvpStore((s) => s.setPassageLength);
	const [passageConfig, setPassageConfig] = useState<GeneratorConfig | null>(
		null,
	);
	console.log("##########", isHost);

	function handleConfigChange(newConfig: GeneratorConfig) {
		if (!socket || !isHost) return;
		setPassageConfig(newConfig);
		socket.emitWithAck("passage:config-change", newConfig).then((passage) => {
			setPassage(passage);
			setPassageLength(passage.length);
		});
	}

	function fetchPassage() {
		if (!socket) return;
		setLoading(true);
		socket
			.emitWithAck("passage:get")
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
		<div className="relative pt-10">
			{passageConfig && !countingDown && !matchStarted ? (
				<div className="absolute top-9 left-3 z-20 flex justify-start items-center gap-2">
					{isHost ? (
						<>
							<Select
								value={passageConfig.language || "English 200"}
								onValueChange={(value) =>
									handleConfigChange({
										...passageConfig,
										language: value as GeneratorConfig["language"],
									})
								}
							>
								<SelectTrigger size="sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{languageOptions.map((lang) => (
										<SelectItem key={lang} value={lang}>
											{lang}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Select
								value={String(passageConfig.wordCount || 50)}
								onValueChange={(value) =>
									handleConfigChange({
										...passageConfig,
										wordCount: Number(value),
									})
								}
							>
								<SelectTrigger size="sm">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{WORD_COUNT_OPTIONS.map((count) => (
										<SelectItem key={count} value={String(count)}>
											{count} words
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<BadgeToggle
								onToggle={(enabled) =>
									handleConfigChange({
										...passageConfig,
										punctuation: enabled,
									})
								}
								enabled={passageConfig.punctuation || false}
							>
								Punctuation
							</BadgeToggle>
							<BadgeToggle
								onToggle={(enabled) => {
									handleConfigChange({
										...passageConfig,
										numbers: enabled,
									});
								}}
								enabled={passageConfig.numbers || false}
							>
								Numbers
							</BadgeToggle>
						</>
					) : (
						<>
							<Badge
								variant="outline"
								className="text-muted-foreground text-sm"
							>
								{passageConfig.language || "English 200"}
							</Badge>
							<Badge
								variant="outline"
								className="text-muted-foreground text-sm"
							>
								{passageConfig.wordCount} Words
							</Badge>
							{passageConfig.punctuation ? (
								<Badge
									variant="outline"
									className="text-muted-foreground text-sm"
								>
									Punctuation
								</Badge>
							) : null}
							{passageConfig.numbers ? (
								<Badge
									variant="outline"
									className="text-muted-foreground text-sm"
								>
									Numbers
								</Badge>
							) : null}
						</>
					)}
				</div>
			) : null}
			<Passage
				words={passage.split(" ")}
				disabled={!matchStarted}
				inputDisabled={isSpectating}
			/>
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
