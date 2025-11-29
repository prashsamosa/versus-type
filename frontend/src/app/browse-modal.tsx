import type { RoomInfo } from "@versus-type/shared/index";
import { RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { authClient } from "@/lib/auth-client";
import { getPublicRooms } from "@/services/pvp.client";

export function BrowseModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [rooms, setRooms] = useState<RoomInfo[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	async function fetchRooms() {
		setLoading(true);
		setError(null);
		try {
			const data = await getPublicRooms();
			setRooms(data || []);
		} catch (err: any) {
			setError(err.message || "Failed to fetch rooms");
		}
		setLoading(false);
	}

	useEffect(() => {
		if (!open) return;
		fetchRooms();
		const interval = setInterval(fetchRooms, 30000);
		return () => clearInterval(interval);
	}, [open]);

	async function handleJoin(roomCode: string) {
		const session = await authClient.getSession();
		if (!session.data) {
			await authClient.signIn.anonymous();
		}
		router.push(`/pvp/${roomCode}`);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[450px]" showCloseButton={false}>
				<DialogHeader className="flex flex-row -mt-2 -mr-1.5 justify-between items-center">
					<DialogTitle>Browse Rooms</DialogTitle>
					<div>
						<Button
							variant="ghost"
							size="icon"
							onClick={fetchRooms}
							disabled={loading}
							className="mr-0.5"
						>
							<RefreshCw
								className={`size-4 ${loading ? "animate-spin" : ""}`}
							/>
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onOpenChange(false)}
						>
							<X className="size-4" />
						</Button>
					</div>
				</DialogHeader>

				<div className="max-h-[300px] min-h-[150px] overflow-y-auto">
					{error && (
						<p className="text-destructive text-center py-4">{error}</p>
					)}

					{!error && rooms.length === 0 && !loading && (
						<p className="text-muted-foreground text-center py-8">
							No public rooms available :(
						</p>
					)}

					{!error && loading && rooms.length === 0 && (
						<p className="text-muted-foreground text-center py-8">Loading...</p>
					)}

					<div className="space-y-2">
						{rooms.map((room) => (
							<Button
								variant="outline"
								key={room.roomCode}
								onClick={() => handleJoin(room.roomCode)}
								className="w-full justify-between"
							>
								<div>
									<span className="font-medium font-mono">{room.roomCode}</span>
									<span
										className={`text-sm ml-2 
                      ${
												room.status === "waiting"
													? "text-green-300/80"
													: "text-yellow-400/80"
											}`}
									>
										{room.status === "waiting" ? "Waiting" : "In Progress"}
									</span>
								</div>
								<div className="text-sm">
									{room.players}/{room.maxPlayers}
								</div>
							</Button>
						))}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
