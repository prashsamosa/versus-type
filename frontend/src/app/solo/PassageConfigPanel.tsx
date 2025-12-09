"use client";

import {
	type GeneratorConfig,
	languageOptions,
} from "@versus-type/shared/passage-generator";
import { BadgeToggle } from "@/components/ui/badge-toggle";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useSmallScreen } from "../hooks/useSmallScreen";

const WORD_COUNT_OPTIONS = [10, 25, 50, 75, 100, 150, 200, 250, 300, 500];

export function PassageConfigPanel({
	config,
	onConfigChange,
	disabled,
}: {
	config: GeneratorConfig;
	onConfigChange: (config: GeneratorConfig) => void;
	disabled?: boolean;
}) {
	const smallScreen = useSmallScreen();
	return (
		<div
			className={
				"flex justify-start items-center gap-2 transition " +
				(disabled ? "opacity-0 pointer-events-none" : "opacity-100")
			}
		>
			<Select
				value={config.language || "English 200"}
				onValueChange={(value) =>
					onConfigChange({
						...config,
						language: value as GeneratorConfig["language"],
					})
				}
			>
				<SelectTrigger
					size="sm"
					className="focus-visible:border-input focus-visible:ring-0"
				>
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
				value={String(config.wordCount || 50)}
				onValueChange={(value) =>
					onConfigChange({
						...config,
						wordCount: Number(value),
					})
				}
			>
				<SelectTrigger
					size="sm"
					className="focus-visible:border-input focus-visible:ring-0"
				>
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
					onConfigChange({
						...config,
						punctuation: enabled,
					})
				}
				enabled={config.punctuation || false}
			>
				{smallScreen ? "P" : "Punctuation"}
			</BadgeToggle>
			<BadgeToggle
				onToggle={(enabled) =>
					onConfigChange({
						...config,
						numbers: enabled,
					})
				}
				enabled={config.numbers || false}
			>
				{smallScreen ? "N" : "Numbers"}
			</BadgeToggle>
		</div>
	);
}
