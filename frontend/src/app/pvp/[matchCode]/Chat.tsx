"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { socket } from "@/socket";
import { useChat } from "./useChat";

export default function Chat() {
	const { messages, sendMessage } = useChat();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const shouldAutoScroll = useRef(true);

	function handleScroll() {
		if (!scrollContainerRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } =
			scrollContainerRef.current;
		// enable auto-scroll within 50px of the bottom
		shouldAutoScroll.current = scrollTop + clientHeight >= scrollHeight - 50;
	}

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (container && shouldAutoScroll.current) {
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages]);

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const input = formData.get("inputMessage") as string;
		sendMessage(input);
		e.currentTarget.reset();
	}
	return (
		<Card className="h-full p-4 flex flex-col gap-2">
			{!socket && (
				<div className="text-destructive p-2">Socket not connected</div>
			)}
			<div
				ref={scrollContainerRef}
				className="overflow-y-auto flex-1"
				onScroll={handleScroll}
			>
				{messages.length === 0 ? (
					<div className="flex items-center justify-center h-full text-muted-foreground text-xl">
						No messages yet
					</div>
				) : (
					messages.map((msg, index) => {
						const isOwnMessage = msg.socketId === socket?.id;
						return (
							<div key={index} className="mb-2 wrap-anywhere">
								{msg.system ? (
									<em className="opacity-70">{msg.message}</em>
								) : (
									<>
										<strong className={isOwnMessage ? "underline" : ""}>
											{msg.username}:
										</strong>{" "}
										{msg.message}
									</>
								)}
							</div>
						);
					})
				)}
				<div ref={messagesEndRef} />
			</div>
			<form onSubmit={handleSubmit} className="flex gap-2">
				<Input type="text" name="inputMessage" className="grow border p-2" />
				<Button type="submit">Send</Button>
			</form>
		</Card>
	);
}
