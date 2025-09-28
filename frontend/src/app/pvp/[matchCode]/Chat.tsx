"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";

type Message = { username: string; message: string };

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	useEffect(() => {
		if (!socket) return;
		const handleNewMessage = (data: Message) => {
			setMessages((prev) => [
				...prev,
				{ username: data.username, message: data.message },
			]);
		};
		socket.on("chat:new-message", handleNewMessage);
		return () => {
			socket.off("chat:new-message", handleNewMessage);
		};
	}, []);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		console.log(socket);
		const formData = new FormData(e.currentTarget);
		const input = formData.get("inputMessage") as string;
		if (input.trim() && socket) {
			socket.emit("chat:send-message", { message: input });
			e.currentTarget.reset();
		}
	}

	return (
		<Card>
			{!socket && (
				<div className="text-destructive p-2">Socket not connected</div>
			)}
			<CardHeader>Chat</CardHeader>
			<CardContent>
				<div className="border rounded p-4 mb-4 h-64 overflow-y-auto">
					{messages.map((msg, index) => (
						<div key={index} className="mb-2">
							<strong>{msg.username}:</strong> {msg.message}
						</div>
					))}
				</div>
				<form onSubmit={handleSubmit} className="flex">
					<Input
						type="text"
						name="inputMessage"
						className="flex-grow border rounded-l p-2"
					/>
					<Button type="submit">Send</Button>
				</form>
			</CardContent>
		</Card>
	);
}
