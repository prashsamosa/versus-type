import { Loader2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorTooltipBtn } from "@/components/ui/error-tooltip-btn";
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
		<ErrorTooltipBtn
			size="lg"
			onClick={handleQuickPlay}
			error={quickPlayError}
			setError={setQuickPlayError}
			disabled={quickPlayLoading}
		>
			{quickPlayLoading ? (
				<Loader2 className="size-4 animate-spin" />
			) : (
				<Zap className="size-4" />
			)}
			{label}
		</ErrorTooltipBtn>
	);
}
