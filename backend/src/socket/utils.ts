import { roomStates } from "./store";

export function calcWpm(typingIndex: number, startedAt?: number): number {
	if (!startedAt) return 0;
	const elapsedTime = Date.now() - startedAt;
	return typingIndex / 5 / (elapsedTime / 1000 / 60);
}

export function getRandomColor(roomCode: string) {
	const colors = [
		"#60A5FA",
		"#34D399",
		"#FBBF24",
		"#A78BFA",
		"#F472B6",
		"#F87171",
		"#818CF8",
		"#14B8A6",
	];
	const colors2 = ["#F43F5E", "#FF00FF", "#FF4500", "#FFFF00"];
	let notUsed = colors.slice();
	let notUsed2 = colors2.slice();
	if (roomStates[roomCode]) {
		for (const userId in roomStates[roomCode].players) {
			notUsed = notUsed.filter(
				(c) => c !== roomStates[roomCode].players[userId].color,
			);
			notUsed2 = notUsed2.filter(
				(c) => c !== roomStates[roomCode].players[userId].color,
			);
		}
		if (notUsed.length === 0) {
			if (notUsed2.length === 0) {
				notUsed = colors.slice();
			} else {
				notUsed = notUsed2;
			}
		}
	}
	return notUsed[Math.floor(Math.random() * notUsed.length)];
}
