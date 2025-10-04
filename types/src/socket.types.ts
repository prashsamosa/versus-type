import type { Server, Socket } from "socket.io";

export type ChatMessage = {
	username: string;
	message: string;
	socketId?: string;
	system?: boolean;
};

export type PlayerInfo = {
	socketId: string;
	username: string;
	isHost: boolean;
};

export interface ServerToClientEvents {
	"pvp:lobby-update": (data: { players: PlayerInfo[] }) => void;
	"pvp:player-joined": (data: { socketId: string; username?: string }) => void;
	"pvp:player-left": (data: { socketId: string; username?: string }) => void;
	"pvp:new-host": (data: { socketId: string; username?: string }) => void;

	"chat:new-message": (data: ChatMessage) => void;
	"chat:history": (messages: ChatMessage[]) => void;

	"chat:error": (data: { message: string }) => void;
}

export interface ClientToServerEvents {
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
	message: string;
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

export type ioSocketClient = Socket<ServerToClientEvents, ClientToServerEvents>;
