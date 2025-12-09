export type GameConfig = {
	showOppCursors: boolean;
	enableConfetti: boolean;
	enableStreak: boolean;
	enableSorting: boolean;
};

const GAME_CONFIG_KEY = "game-config";
const defaultGameConfig: GameConfig = {
	showOppCursors: true,
	enableConfetti: true,
	enableStreak: true,
	enableSorting: true,
};

export function loadGameConfig(): GameConfig {
	if (typeof window === "undefined") return defaultGameConfig;
	try {
		const stored = localStorage.getItem(GAME_CONFIG_KEY);
		if (stored) {
			return { ...defaultGameConfig, ...JSON.parse(stored) };
		}
	} catch {}
	return defaultGameConfig;
}

export function saveGameConfig(config: GameConfig) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(GAME_CONFIG_KEY, JSON.stringify(config));
	} catch {}
}
