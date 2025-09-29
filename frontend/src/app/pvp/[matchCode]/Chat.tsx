"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";

type Message = { username: string; message: string; system?: boolean };

export default function Chat() {
	const [messages, setMessages] = useState<Message[]>([]);
	useEffect(() => {
		if (!socket) return;
		function handleNewMessage(data: any) {
			try {
				setMessages((prev) => [
					...prev,
					{ username: data.username, message: data.message },
				]);
			} catch (e) {
				console.error("Error parsing new message", e);
			}
		}
		function handleHistory(data: any) {
			try {
				setMessages(data);
			} catch (e) {
				console.error("Error parsing chat history", e);
			}
		}
		function handleNewJoin(data: any) {
			console.log("Player joined:", data);
			if (!data.username) {
				console.error("No username in join data");
				return;
			}
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

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
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
				<div className="border rounded p-4 mb-4 h-64 overflow-y-auto md:w-xl">
					{messages.map((msg, index) => (
						<div key={index} className="mb-2 wrap-anywhere">
							{msg.system ? (
								<em className="opacity-70">{msg.message}</em>
							) : (
								<>
									<strong>{msg.username}:</strong> {msg.message}
								</>
							)}
						</div>
					))}
				</div>
				<form onSubmit={handleSubmit} className="flex gap-2">
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
