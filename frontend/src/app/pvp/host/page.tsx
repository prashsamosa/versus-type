"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { hostMatch } from "@/services/pvp.client";

export default function HostPage() {
	const [isPrivate, setIsPrivate] = useState(false);
	const router = useRouter();
	async function handleSubmit() {
		const matchCode = await hostMatch(isPrivate);
		router.push(`/pvp/${matchCode}?isHost=true`);
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
					<Button onClick={handleSubmit} />
				</div>
			</Card>
		</div>
	);
}
