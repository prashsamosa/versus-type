import { MAX_PLAYERS } from "@versus-type/shared/consts";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { authClient } from "@/lib/auth-client";
import { hostMatch } from "@/services/pvp.client";

export function HostModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [isPrivate, setIsPrivate] = useState(false);
	const [maxPlayers, setMaxPlayers] = useState(8);
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
			const roomCode = await hostMatch({ isPrivate, maxPlayers });
			router.push(`/pvp/${roomCode}`);
		} catch (err: any) {
			setError(err.message);
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[350px]">
				<DialogHeader>
					<DialogTitle className="text-center">Host a Match</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col space-y-4">
					<div className="flex items-center space-x-2">
						<Label htmlFor="private-switch">Private</Label>
						<Switch
							id="private-switch"
							checked={isPrivate}
							onCheckedChange={(checked) => setIsPrivate(!!checked)}
						/>
					</div>
					<div className="flex items-center justify-between">
						<Label>Max Players</Label>
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="icon"
								onClick={() => setMaxPlayers(Math.max(2, maxPlayers - 1))}
								disabled={maxPlayers <= 2}
							>
								-
							</Button>
							<span className="text-center font-mono">{maxPlayers}</span>
							<Button
								variant="outline"
								size="icon"
								onClick={() =>
									setMaxPlayers(Math.min(MAX_PLAYERS, maxPlayers + 1))
								}
								disabled={maxPlayers >= MAX_PLAYERS}
							>
								+
							</Button>
						</div>
					</div>
					<Button onClick={handleSubmit} disabled={loading} className="w-full">
						{loading ? "Hosting..." : "Host Match"}
					</Button>
					{error && <p className="text-destructive text-center">{error}</p>}
				</div>
			</DialogContent>
		</Dialog>
	);
}
