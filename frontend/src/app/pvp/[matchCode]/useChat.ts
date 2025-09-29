import { useEffect, useState } from "react";
import { socket } from "@/socket";

export type Message = { username: string; message: string; system?: boolean };

export function useChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	useEffect(() => {
		if (!socket) return;
		function handleNewMessage(data: { username: string; message: string }) {
			setMessages((prev) => [
				...prev,
				{ username: data.username, message: data.message },
			]);
		}
		function handleHistory(
			messages: Array<{ username: string; message: string }>,
		) {
			setMessages(messages);
		}
		function handleNewJoin(data: { socketId: string; username: string }) {
			console.log("Player joined:", data);
			setMessages((prev) => [
				...prev,
				{
					username: "System",
					system: true,
					message: `${data.username} in da house`,
				},
			]);
		}
		socket.on("pvp:player-joined", handleNewJoin);
		socket.on("chat:history", handleHistory);
		socket.on("chat:new-message", handleNewMessage);
		return () => {
			socket?.off("chat:new-message", handleNewMessage);
			socket?.off("chat:history", handleHistory);
			socket?.off("pvp:player-joined", handleNewJoin);
		};
	}, []);

	function sendMessage(message: string) {
		if (message.trim() && socket) {
			socket.emit("chat:send-message", { message });
		}
	}
	return { messages, sendMessage };
}
