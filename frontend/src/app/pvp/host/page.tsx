"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { hostMatch } from "@/services/pvp.client";
import { authClient } from "@/lib/auth-client";

export default function HostPage() {
	const [isPrivate, setIsPrivate] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();
	async function handleSubmit() {
		setLoading(true);
		try {
			const session = await authClient.getSession();
			if (!session.data) {
				await authClient.signIn.anonymous();
			}
			const matchCode = await hostMatch(isPrivate);
			router.push(`/pvp/${matchCode}?isHost=true`);
		} catch (err: any) {
			setError(`Error: ${err.message}`);
			setLoading(false);
		}
	}

	return (
		<div className="flex flex-col justify-center bg-background min-h-screen m-auto">
			<Card className="w-[350px] mx-auto mb-4 p-4">
				<div className="text-center text-2xl font-bold mb-4">Host a Match</div>
				<div className="flex flex-col space-y-4">
					<div className="flex items-center space-x-2">
						<Label htmlFor="private-switch">Private</Label>
						<Switch
							id="private-switch"
							checked={isPrivate}
							onCheckedChange={(checked) => setIsPrivate(!!checked)}
						/>
					</div>
					<Button onClick={handleSubmit} disabled={loading} className="w-full">
						{loading ? "Hosting..." : "Host Match"}
					</Button>
					{error && <p className="text-destructive text-center">{error}</p>}
				</div>
			</Card>
		</div>
	);
}
