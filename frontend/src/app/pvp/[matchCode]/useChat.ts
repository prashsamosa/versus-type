import type { ChatMessage, ServerToClientEvents } from "@versus-type/types";
import { useEffect, useState } from "react";
import { socket } from "@/socket";

export function useChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	useEffect(() => {
		if (!socket) return;

		function handleNewMessage(data: ChatMessage) {
			setMessages((prev) => [...prev, data]);
		}

		function handleHistory(
			messages: Array<{ username: string; message: string }>,
		) {
			setMessages(messages);
		}

		function handleChatError(data: { message: string }) {
			setMessages((prev) => [
				...prev,
				{
					username: "",
					system: true,
					message: `Chat error: ${data.message}`,
				},
			]);
		}

		const eventHandlers: Partial<
			Record<keyof ServerToClientEvents, (...args: any[]) => void>
		> = {
			"chat:new-message": handleNewMessage,
			"chat:history": handleHistory,
			"chat:error": handleChatError,
			// chat:new-message respond to these already
			// "pvp:player-joined": handleNewJoin,
			// "pvp:player-left": handlePlayerLeft,
		};

		Object.entries(eventHandlers).forEach(([event, handler]) => {
			socket?.on(event as keyof ServerToClientEvents, handler);
		});

		return () => {
			Object.entries(eventHandlers).forEach(([event, handler]) => {
				socket?.off(event as keyof ServerToClientEvents, handler);
			});
		};
	}, []);

	function sendMessage(message: string) {
		if (message.trim() && socket) {
			socket.emit("chat:send-message", { message });
		}
	}

	return { messages, sendMessage };
}
