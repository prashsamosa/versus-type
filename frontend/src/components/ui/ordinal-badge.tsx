import { Medal } from "lucide-react";
import { useSmallScreen } from "@/app/hooks/useSmallScreen";
import { getOrdinalSuffix } from "@/lib/utils";

export function OrdinalBadge({
	ordinal,
	large,
}: {
	ordinal: number | null;
	large?: boolean;
}) {
	const smallScreen = useSmallScreen();
	if (ordinal === null) return null;

	const colors: Record<number, string> = {
		1: "text-yellow-400",
		2: "text-gray-300",
		3: "text-amber-600",
	};

	return (
		<div className="flex items-center gap-1.5">
			{ordinal <= 3 && (
				<Medal
					className={`${colors[ordinal]} ${large ? (smallScreen ? "size-8" : "size-14") : "size-4"}`}
				/>
			)}
			<span
				className={
					(ordinal <= 3 ? colors[ordinal] : "text-muted-foreground") +
					" " +
					(large
						? smallScreen
							? "text-2xl font-bold"
							: "text-4xl font-bold"
						: "text-sm font-medium")
				}
			>
				{getOrdinalSuffix(ordinal)}
			</span>
		</div>
	);
}
