import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function UsernameInput({
	setUsername,
}: {
	setUsername: (username: string) => void;
}) {
	const [error, setError] = useState<string | null>(null);
	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		let username = formData.get("username") as string;
		username = username.trim();
		if (!username) {
			setError("Username cannot be empty");
			return;
		}
		if (username.length > 20) {
			setError("Username cannot be longer than 20 characters");
			return;
		}
		setUsername(username);
	}
	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<Card>
				<form onSubmit={handleSubmit}>
					<div className="flex gap-2 px-4">
						<Input placeholder="Username" name="username" />
						<Button type="submit">Set</Button>
					</div>
					{error && <p className="text-destructive">{error}</p>}
				</form>
			</Card>
		</div>
	);
}
