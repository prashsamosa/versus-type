import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { getQuickPlayRoom } from "@/services/pvp.client";
export function QuickPlayButton({ label = "Quick Play" }: { label?: string }) {
	const router = useRouter();
	const [quickPlayLoading, setQuickPlayLoading] = useState(false);
	const [quickPlayError, setQuickPlayError] = useState<string | null>(null);

	async function handleQuickPlay() {
		setQuickPlayLoading(true);
		setQuickPlayError(null);
		try {
			const roomCode = await getQuickPlayRoom();
			router.push(`/pvp/${roomCode}`);
		} catch (err) {
			setQuickPlayError(
				err instanceof Error ? err.message : "Failed to find a match",
			);
		} finally {
			setQuickPlayLoading(false);
		}
	}
	return (
		<Tooltip
			open={!!quickPlayError}
			onOpenChange={(open) => !open && setQuickPlayError(null)}
		>
			<TooltipTrigger asChild>
				<Button size="lg" onClick={handleQuickPlay} disabled={quickPlayLoading}>
					{quickPlayLoading ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Zap className="size-4" />
					)}
					{label}
				</Button>
			</TooltipTrigger>
			<TooltipContent className="text-destructive text-sm">
				{quickPlayError}
			</TooltipContent>
		</Tooltip>
	);
}
