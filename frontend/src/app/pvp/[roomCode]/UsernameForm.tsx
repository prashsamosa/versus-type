"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { authClient } from "@/lib/auth-client";

export function UsernameForm() {
	const [message, setMessage] = useState<{
		value: string;
		isError: boolean;
	} | null>(null);
	const [loading, setLoading] = useState(false);
	let username = authClient.useSession().data?.user.name || "";
	if (username === "Anonymous") username = "";

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		const formData = new FormData(e.currentTarget);
		let username = formData.get("username") as string;
		username = username.trim();
		let gotError = false;

		if (!username) {
			setMessage({ value: "Username cannot be empty", isError: true });
			gotError = true;
		} else if (username.length > 20) {
			setMessage({
				value: "Username cannot be longer than 20 characters",
				isError: true,
			});
			gotError = true;
		} else if (username.length < 3) {
			setMessage({
				value: "Username must be at least 3 characters long",
				isError: true,
			});
			gotError = true;
		} else if (username === "<Unknown>") {
			setMessage({ value: 'Username cannot be "<Unknown>"', isError: true });
			gotError = true;
		}

		if (gotError) {
			setLoading(false);
			return;
		}
		authClient
			.updateUser({ name: username })
			.catch((err) =>
				setMessage({ value: err.message || "Error occurred", isError: true }),
			)
			.then((data) => {
				if (data?.error) {
					setMessage({
						value: data.error.message
							? "Error: " + data.error.message
							: "Unexpected error occurred",
						isError: true,
					});
				} else {
					setMessage({
						value: "Saved",
						isError: false,
					});
				}
			})
			.finally(() => setLoading(false));
	}

	return (
		<form onSubmit={handleSubmit}>
			<div className="flex gap-2 px-4 w-xs">
				<Input placeholder="Username" name="username" defaultValue={username} />
				<TooltipButton
					type="submit"
					isError={message ? message.isError : true}
					message={message ? message.value : null}
					clearMessage={() => setMessage(null)}
					disabled={loading}
					className="w-16"
				>
					{loading ? <Loader2 className="animate-spin" /> : "Save"}
				</TooltipButton>
			</div>
		</form>
	);
}
