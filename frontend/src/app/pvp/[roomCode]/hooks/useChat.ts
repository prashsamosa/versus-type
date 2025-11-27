import { useEffect } from "react";
import {
	type EventHandlers,
	registerSocketHandlers,
} from "@/lib/registerSocketHandlers";
import { socket } from "@/socket";
import { usePvpStore } from "../store";

export function useChat() {
	const messages = usePvpStore((s) => s.chatMessages);
	const addMessage = usePvpStore((s) => s.addChatMessage);

	useEffect(() => {
		if (!socket) return;

		const eventHandlers: EventHandlers = {
			"chat:new-message": (data) => {
				addMessage(data);
			},
			"chat:error": (data) => {
				addMessage({
					username: "",
					system: true,
					message: `Chat error: ${data.message}`,
				});
			},
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
