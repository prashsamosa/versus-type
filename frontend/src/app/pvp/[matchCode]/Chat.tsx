"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";
import { useChat } from "./useChat";

export default function Chat() {
	const { messages, sendMessage } = useChat();
	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const input = formData.get("inputMessage") as string;
		sendMessage(input);
		e.currentTarget.reset();
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
