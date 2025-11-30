import type { Server, Socket } from "socket.io";
import z from "zod";
import { MAX_PLAYERS } from "../consts";
import type { GeneratorConfig } from "../passage-generator";

export type ChatMessage = {
	username: string;
	message: string;
	userId?: string;
	system?: boolean;
};

export type PlayerInfo = {
	isHost?: boolean;
	username?: string;
	spectator: boolean;
	ordinal?: number;
	disconnected?: boolean;
	color: string;

	// for now
	finished?: boolean;
	typingIndex: number;
	wpm?: number;
	accuracy?: number;
};

export type LobbyInfo = {
	[userId: string]: PlayerInfo;
};

export type RoomInfo = {
	roomCode: string;
	players: number;
	status: "inProgress" | "waiting";
	maxPlayers: number;
	passageConfig: GeneratorConfig;
	avgWpm?: number;
};

export type JoinResponse = {
	success: boolean;
	message?: string;
	gameState?: {
		isStarted: boolean;
		typingIndex: number;
		oppTypingIndexes: { [userId: string]: number };
		passage: string;
		passageConfig: GeneratorConfig;
		chatHistory: ChatMessage[];
	};
};

export type WpmInfo = {
	[userId: string]: number;
};

export type MatchResults = {
	[userId: string]: {
		wpm: number;
		accuracy: number;
		ordinal: number;
	};
};

export const roomSettingsSchema = z.object({
	isPrivate: z.boolean(),
	maxPlayers: z.number().min(2).max(MAX_PLAYERS),
});
export type RoomSettings = z.infer<typeof roomSettingsSchema>;

export interface ServerToClientEvents {
	"pvp:countdown": (seconds: number) => void;
	"pvp:progress-update": (data: {
		userId: string;
		typingIndex: number;
	}) => void;
	"pvp:match-ended": (data: MatchResults) => void;
	"pvp:disconnect": (data: { reason: string }) => void;
	"pvp:lobby-update": (lobby: LobbyInfo) => void;
	"pvp:wpm-update": (data: WpmInfo) => void;

	"chat:new-message": (data: ChatMessage) => void;
	"passage:put": (passage: string, passageConfig: GeneratorConfig) => void;
	"chat:error": (data: { message: string }) => void;
}

export interface ClientToServerEvents {
	"pvp:start-match": (
		callback: (response: { success: boolean; message?: string }) => void,
	) => void;
	"pvp:key-press": (key: string) => void;
	"pvp:backspace": (amount: number) => void;
	ping: (callback: () => void) => void;
	"pvp:join": (
		data: {
			roomCode: string;
			username: string;
		},
		callback: (response: JoinResponse) => void,
	) => void;

	"chat:send-message": (data: { message: string }) => void;

	"passage:config-change": (config: GeneratorConfig) => void;
}

export interface InterServerEvents {}

export interface SocketData {
	username?: string;
	roomCode?: string;
	isHost?: boolean;
	userId: string;
}

export type ioServer = Server<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;

export type ioSocket = Socket<
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
>;
