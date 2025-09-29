// Server to Client Events (what server sends to client)
export interface ServerToClientEvents {
	// PvP events
	"pvp:player-joined": (data: { socketId: string; username: string }) => void;

	// Chat events
	"chat:new-message": (data: { username: string; message: string }) => void;

	"chat:history": (
		messages: Array<{
			username: string;
			message: string;
		}>,
	) => void;

	"chat:error": (data: { message: string }) => void;
}

// Client to Server Events (what client sends to server)
export interface ClientToServerEvents {
	// PvP events
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

	// Chat events
	"chat:send-message": (data: { message: string }) => void;
}

// Inter-server events (for scaling across multiple servers)
export interface InterServerEvents {
	ping: () => void;
}

// Socket data (stored on each socket instance)
export interface SocketData {
	username?: string;
}

// Common response type for socket operations
export interface SocketResponse {
	success: boolean;
	message: string;
}
