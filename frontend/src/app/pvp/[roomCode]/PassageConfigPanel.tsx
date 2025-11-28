import {
	type GeneratorConfig,
	languageOptions,
} from "@versus-type/shared/passage-generator";
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
import { socket } from "@/socket";
import { usePvpStore } from "./store";

const WORD_COUNT_OPTIONS = [10, 25, 50, 75, 100, 150, 200, 250, 300, 500];

export function PassageConfigPanel() {
	const passageConfig = usePvpStore((s) => s.passageConfig);
	const setPassageConfig = usePvpStore((s) => s.setPassageConfig);
	const setPassage = usePvpStore((s) => s.setPassage);
	const userId = authClient.useSession()?.data?.user?.id;
	const players = usePvpStore((s) => s.players);
	const isHost = userId ? players[userId]?.isHost || false : false;
	const countingDown = usePvpStore((s) => s.countingDown);
	const matchStarted = usePvpStore((s) => s.matchStarted);

	function handleConfigChange(newConfig: GeneratorConfig) {
		if (!socket || !isHost) return;
		setPassageConfig(newConfig);
		socket
			.emitWithAck("passage:config-change", newConfig)
			.then((newPassage) => {
				setPassage(newPassage);
			});
	}
	if (!passageConfig || countingDown || matchStarted) return null;

	return (
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
					<Badge variant="outline" className="text-muted-foreground text-sm">
						{passageConfig.language || "English 200"}
					</Badge>
					<Badge variant="outline" className="text-muted-foreground text-sm">
						{passageConfig.wordCount} Words
					</Badge>
					{passageConfig.punctuation ? (
						<Badge variant="outline" className="text-muted-foreground text-sm">
							Punctuation
						</Badge>
					) : null}
					{passageConfig.numbers ? (
						<Badge variant="outline" className="text-muted-foreground text-sm">
							Numbers
						</Badge>
					) : null}
				</>
			)}
		</div>
	);
}
