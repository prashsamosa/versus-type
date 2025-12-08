import { roomStates } from "./store";

const colors = [
	["#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#F87171"],
	["#73e9f7", "#acf80c", "#f466e5"],
	["#F43F5E", "#FF00FF", "#FF4500", "#FFFF00"],
];

export function calcWpm(typingIndex: number, startedAt?: number): number {
	if (!startedAt) return 0;
	const elapsedTime = Date.now() - startedAt;
	return typingIndex / 5 / (elapsedTime / 1000 / 60);
}

export function getRandomColor(roomCode: string) {
	const usedColors = new Set(
		Object.values(roomStates[roomCode]?.players || {}).map((p) => p.color),
	);

	for (const colorSet of colors) {
		const availableColors = colorSet.filter((c) => !usedColors.has(c));
		if (availableColors.length > 0) {
			return availableColors[
				Math.floor(Math.random() * availableColors.length)
			];
		}
	}

	for (const colorSet of colors) {
		if (colorSet.length > 0) {
			return colorSet[Math.floor(Math.random() * colorSet.length)];
		}
	}

	return "#FFFFFF";
}
