"use client";

import { MessageCircleMore } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	SexyCard,
	SexyCardContent,
	SexyCardHeader,
} from "@/components/ui/sexy-card";
import { authClient } from "@/lib/auth-client";
import { socket } from "@/socket";
import { useChat } from "./hooks/useChat";
import { usePvpStore } from "./store";

export default function Chat() {
	const { messages, sendMessage } = useChat();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const shouldAutoScroll = useRef(true);
	const userId = authClient.useSession().data?.user.id;
	const players = usePvpStore((s) => s.players);

	function handleScroll() {
		if (!scrollContainerRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } =
			scrollContainerRef.current;
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
		<SexyCard className="flex flex-col h-full">
			<SexyCardHeader>
				Chat
				{!socket && (
					<div className="text-destructive p-2">Socket not connected</div>
				)}
			</SexyCardHeader>
			<SexyCardContent className="flex flex-col justify-between pb-3">
				<div
					ref={scrollContainerRef}
					className="overflow-y-auto"
					onScroll={handleScroll}
				>
					{messages.length === 0 ? (
						<div className="flex flex-col gap-2 items-center justify-center h-full text-muted-foreground text-xl">
							<MessageCircleMore />
							No messages yet
						</div>
					) : (
						messages.map((msg, index) => {
							const isOwnMessage = msg.userId === userId;
							return (
								<div key={index} className="mb-2 wrap-anywhere">
									{msg.system ? (
										<em className="opacity-70">{msg.message}</em>
									) : (
										<>
											<strong
												className={isOwnMessage ? "underline" : ""}
												style={
													msg.userId
														? { color: players[msg.userId]?.color }
														: {}
												}
											>
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
				<form onSubmit={handleSubmit} className="flex gap-2 -mx-1">
					<Input
						type="text"
						name="inputMessage"
						className="grow border p-2 bg-input/15"
					/>
					<Button type="submit">Send</Button>
				</form>
			</SexyCardContent>
		</SexyCard>
	);
}
