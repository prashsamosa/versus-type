import type { ChatMessage, ioServer, ioSocket } from "@versus-type/shared";
import { roomStates } from "./store";

const MAX_CHAT_MESSAGES = 100;

export function registerChatHandlers(io: ioServer, socket: ioSocket) {
	socket.on("chat:send-message", (data) => {
		const username = socket.data.username;
		if (!username) {
			return socket.emit("chat:error", { message: "Username not set" });
		}
		const { message } = data;
		if (message.trim().length === 0) {
			return socket.emit("chat:error", { message: "Empty message" });
		}
		const roomCode = socket.rooms.size > 1 ? Array.from(socket.rooms)[1] : null;
		if (!roomCode) {
			return socket.emit("chat:error", { message: "Not in a match room" });
		}
		emitNewMessage(io, roomCode, {
			username,
			message,
			userId: socket.data.userId || socket.id,
		});
	});
}

export function emitNewMessage(
	io: ioServer,
	roomCode: string,
	newMessage: ChatMessage,
) {
	const roomState = roomStates[roomCode];
	if (!roomState) {
		console.warn(
			"emitNewMessage: Room state not found for room code:",
			roomCode,
		);
		return;
	}

	const messages = roomState.chat;
	if (messages && messages.length >= MAX_CHAT_MESSAGES) messages.shift();

	messages?.push(newMessage);

	io.to(roomCode).emit("chat:new-message", newMessage);
}

export function broadcastShutdown(io: ioServer, shutdownDelay: string) {
	io.emit("chat:new-message", {
		username: "",
		message: `Server restarting in ${shutdownDelay} seconds`,
		system: true,
	});
}
