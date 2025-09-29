import type { Server, Socket } from "socket.io";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData,
} from "@versus-type/types";

const chatMessages = new Map<
	string,
	Array<{ username: string; message: string }>
>();

export function registerChatHandlers(
	io: Server<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>,
	socket: Socket<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>,
) {
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
		if (!chatMessages.has(matchCode)) {
			chatMessages.set(matchCode, []);
		}
		const newMessage = { username, message: message.trim() };
		const messages = chatMessages.get(matchCode);
		messages?.push(newMessage);

		io.to(matchCode).emit("chat:new-message", newMessage);
	});
}

export function sendChatHistory(
	socket: Socket<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>,
	matchCode: string,
) {
	const messages = chatMessages.get(matchCode) || [];
	socket.emit("chat:history", messages);
}
