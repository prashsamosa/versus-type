"use client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { ErrorTooltipBtn } from "@/components/ui/error-tooltip-btn";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export function UsernameForm({
	setUsername,
}: {
	setUsername?: (username: string) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	let username = authClient.useSession().data?.user.name || "";
	if (username === "Anonymous") username = "";

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		const formData = new FormData(e.currentTarget);
		let username = formData.get("username") as string;
		username = username.trim();
		if (!username) {
			setError("Username cannot be empty");
		}
		if (username.length > 20) {
			setError("Username cannot be longer than 20 characters");
		}
		if (username === "<Unknown>") {
			setError('Username cannot be "<Unknown>"');
		}

		if (error) {
			setLoading(false);
			return;
		}
		authClient
			.updateUser({ name: username })
			.then(() => {
				setUsername?.(username);
			})
			.catch((err) => {
				setError(err.message);
			})
			.finally(() => {
				setLoading(false);
			});
	}

	return (
		<form onSubmit={handleSubmit}>
			<div className="flex gap-2 px-4 w-md">
				<Input placeholder="Username" name="username" defaultValue={username} />
				<ErrorTooltipBtn
					type="submit"
					error={error}
					setError={setError}
					disabled={loading}
				>
					{loading ? <Loader2 className="animate-spin" /> : "Save"}
				</ErrorTooltipBtn>
			</div>
		</form>
	);
}
