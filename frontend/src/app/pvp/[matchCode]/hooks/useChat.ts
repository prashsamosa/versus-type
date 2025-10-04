import type { ChatMessage } from "@versus-type/types";
import { useEffect, useState } from "react";
import {
	type EventHandlers,
	registerSocketHandlers,
} from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";

export function useChat() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);

	useEffect(() => {
		if (!socket) return;

		const eventHandlers: EventHandlers = {
			"chat:new-message": (data) => {
				setMessages((prev) => [...prev, data]);
			},
			"chat:history": (data) => {
				setMessages(data);
			},
			"chat:error": (data) => {
				setMessages((prev) => [
					...prev,
					{
						username: "",
						system: true,
						message: `Chat error: ${data.message}`,
					},
				]);
			},
			// chat:new-message respond to these already
			// "pvp:player-joined": handleNewJoin,
			// "pvp:player-left": handlePlayerLeft,
		};
		const unregister = registerSocketHandlers(socket, eventHandlers);
		return unregister;
	}, []);

	function sendMessage(message: string) {
		if (message.trim() && socket) {
			socket.emit("chat:send-message", { message });
		}
	}

	return { messages, sendMessage };
}
