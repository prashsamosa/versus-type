import type {
	ClientToServerEvents,
	ServerToClientEvents,
} from "@versus-type/shared";
import type { Socket } from "socket.io-client";

export type EventHandlers = Partial<ServerToClientEvents>;

export function registerSocketHandlers(
	socket: Socket<ServerToClientEvents, ClientToServerEvents>,
	eventHandlers: EventHandlers,
): () => void {
	Object.entries(eventHandlers).forEach(([event, handler]) => {
		socket?.on(event as keyof ServerToClientEvents, handler);
	});

	return () => {
		Object.entries(eventHandlers).forEach(([event, handler]) => {
			socket?.off(event as keyof ServerToClientEvents, handler);
		});
	};
}
