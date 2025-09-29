export type ChatMessage = {
	username: string;
	message: string;
	system?: boolean;
};

export interface ServerToClientEvents {
	"pvp:player-joined": (data: { socketId: string; username: string }) => void;
	"pvp:player-left": (data: { socketId: string; username: string }) => void;

	"chat:new-message": (data: ChatMessage) => void;
	"chat:history": (
		messages: Array<{
			username: string;
			message: string;
		}>,
	) => void;

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

export interface SocketData {
	username?: string;
	matchCode?: string;
}

// ack response type
export interface SocketResponse {
	success: boolean;
	message: string;
}
