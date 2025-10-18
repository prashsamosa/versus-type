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
	"pvp:start-match": (callback: (response: SocketResponse) => void) => void;
	"pvp:key-press": (key: string) => void;
	"pvp:get-passage": (callback: (passage: string) => void) => void;
	ping: (callback: () => void) => void;
	"pvp:join-as-host": (
		data: {
			matchCode: string;
			username: string;
		},
		callback: (response: SocketResponse) => void,
	) => void;

	"pvp:join": (
		data: {
			matchCode: string;
			username: string;
		},
		callback: (response: SocketResponse) => void,
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

// ack response type
export interface SocketResponse {
	success: boolean;
	message?: string;
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
