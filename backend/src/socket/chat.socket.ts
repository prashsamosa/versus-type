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
		const matchCode =
			socket.rooms.size > 1 ? Array.from(socket.rooms)[1] : null;
		if (!matchCode) {
			return socket.emit("chat:error", { message: "Not in a match room" });
		}
		emitNewMessage(io, matchCode, { username, message, socketId: socket.id });
	});
}

export function sendChatHistory(socket: ioSocket, matchCode: string) {
	const messages = chatMessages.get(matchCode) || [];
	socket.emit("chat:history", messages);
}

export function emitNewMessage(
	io: ioServer,
	matchCode: string,
	newMessage: ChatMessage,
) {
	console.log("Emitting message to", matchCode, newMessage);
	if (!chatMessages.has(matchCode)) {
		chatMessages.set(matchCode, []);
	}
	const messages = chatMessages.get(matchCode);
	messages?.push(newMessage);

	io.to(matchCode).emit("chat:new-message", newMessage);
}
