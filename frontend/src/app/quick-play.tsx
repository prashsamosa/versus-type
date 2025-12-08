import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TooltipButton } from "@/components/ui/tooltip-button";
import { getQuickPlayRoom } from "@/services/pvp.client";

export function QuickPlayButton({
	label = "Quick Play",
	className,
	icon,
}: {
	label?: string;
	className?: string;
	icon?: React.ReactNode;
}) {
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
		<TooltipButton
			size="lg"
			onClick={handleQuickPlay}
			message={quickPlayError}
			clearMessage={() => setQuickPlayError(null)}
			disabled={quickPlayLoading}
			className={className}
		>
			{quickPlayLoading ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				icon || <Zap className="size-4" />
			)}
			{label}
		</TooltipButton>
	);
}
