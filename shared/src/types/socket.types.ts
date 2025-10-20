import type { Server, Socket } from "socket.io";

export type ChatMessage = {
	username: string;
	message: string;
	userId?: string;
	system?: boolean;
};

export type PlayerState = {
	isHost?: boolean;
	username?: string;
	typingIndex: number;
	spectator: boolean;
	completed?: boolean;
	color: string;
	disconnected?: boolean;
};

export type PlayersInfo = {
	[userId: string]: PlayerState;
};

export type JoinResponse = {
	success: boolean;
	message?: string;
	isStarted?: boolean;
	typingIndex?: number;
};

export interface ServerToClientEvents {
	"pvp:countdown": (seconds: number) => void;
	"pvp:progress-update": (data: {
		userId: string;
		typingIndex: number;
	}) => void;

	"pvp:lobby-update": (players: PlayersInfo) => void;

	"chat:new-message": (data: ChatMessage) => void;
	"chat:history": (messages: ChatMessage[]) => void;

	"chat:error": (data: { message: string }) => void;
}

export interface ClientToServerEvents {
	"pvp:start-match": (
		callback: (response: { success: boolean; message?: string }) => void,
	) => void;
	"pvp:key-press": (key: string) => void;
	"pvp:backspace": (amount: number) => void;
	"pvp:get-passage": (callback: (passage: string) => void) => void;
	ping: (callback: () => void) => void;
	"pvp:join": (
		data: {
			matchCode: string;
			username: string;
		},
		callback: (response: JoinResponse) => void,
	) => void;

	"chat:send-message": (data: { message: string }) => void;
}

export interface InterServerEvents {}

export interface SocketData {
	username?: string;
	matchCode?: string;
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
