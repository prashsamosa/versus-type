import type { AccuracyState } from "@versus-type/shared/accuracy";
import type { ChatMessage } from "@versus-type/shared/index";
import type { GeneratorConfig } from "@versus-type/shared/passage-generator";

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

export type RoomType = "public" | "private" | "single-match";

export type RoomState = {
	status: "inProgress" | "waiting" | "closed";
	type: RoomType;
	passage: string;
	hostId: string | null;
	isMatchStarted: boolean;
	isMatchEnded: boolean;
	players: { [userId: string]: PlayerState };
	passageConfig: GeneratorConfig;
	chat: ChatMessage[];
	// currentMatchId: string | null;
};
