import type { AccuracyState } from "@versus-type/shared/accuracy";

export type PlayerState = {
	isHost?: boolean;
	username?: string;
	color: string;
	spectator: boolean;
	disconnected?: boolean;

	// game-specific, needs RESET
	typingIndex: number;
	wpm?: number;
	startedAt?: number;
	accuracy?: number;
	accState?: AccuracyState;
	finished?: boolean;
	timeTyped?: number;
	ordinal?: number;
	incorrectIdx: number | null;
};

export type RoomState = {
	status: "inProgress" | "waiting" | "closed";
	passage: string;
	hostId: string | null;
	isMatchStarted: boolean;
	isMatchEnded: boolean;
	players: { [userId: string]: PlayerState };
	dbId: string;
	// currentMatchId: string | null;
	// settings: GeneratorConfig;
};
