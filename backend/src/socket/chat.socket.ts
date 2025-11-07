import type { ChatMessage, ioServer, ioSocket } from "@versus-type/shared";

export const chatMessages = new Map<string, Array<ChatMessage>>();

export function registerChatHandlers(io: ioServer, socket: ioSocket) {
	socket.on("chat:send-message", (data) => {
		console.log("chat:send-message", data);
		const username = socket.data.username;
		if (!username) {
			return socket.emit("chat:error", { message: "Username not set" });
		}
		const { message } = data;
		if (message.trim().length === 0) {
			return socket.emit("chat:error", { message: "Empty message" });
		}
		const roomCode =
			socket.rooms.size > 1 ? Array.from(socket.rooms)[1] : null;
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

export function sendChatHistory(socket: ioSocket, roomCode: string) {
	const messages = chatMessages.get(roomCode) || [];
	socket.emit("chat:history", messages);
}

export function emitNewMessage(
	io: ioServer,
	roomCode: string,
	newMessage: ChatMessage,
) {
	console.log("Emitting message to", roomCode, newMessage);
	if (!chatMessages.has(roomCode)) {
		chatMessages.set(roomCode, []);
	}
	const messages = chatMessages.get(roomCode);
	messages?.push(newMessage);

	io.to(roomCode).emit("chat:new-message", newMessage);
}
