"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

export default function JoinPage() {
	const ref = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		try {
			const session = await authClient.getSession();
			if (!session.data) {
				await authClient.signIn.anonymous();
			}
			const matchCode = ref.current?.value.trim();
			router.push(`/pvp/${matchCode}`);
		} catch (_err) {
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col justify-center bg-background min-h-screen m-auto">
			<Card className="w-[350px] mx-auto mb-4 p-4">
				<form onSubmit={handleSubmit}>
					<Input placeholder="Match Code" ref={ref} />
					<Button type="submit" className="w-full mt-4" disabled={loading}>
						{loading ? "Joining..." : "Join Match"}
					</Button>
				</form>
			</Card>
		</div>
	);
}
