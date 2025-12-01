import { Eye } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function StatusSign({
	isSpectating,
	waitingForPlayers,
}: {
	isSpectating: boolean;
	waitingForPlayers: boolean;
}) {
	if (!isSpectating && !waitingForPlayers) {
		return null;
	}

	return (
		<div
			className={
				"absolute left-1/2 -translate-x-1/2 " +
				(waitingForPlayers ? "top-6" : "top-14")
			}
		>
			<Tooltip>
				<TooltipTrigger className="cursor-default">
					<div
						className="text-xl text-foreground opacity-70 flex items-center gap-2 bg-input/60 border px-10 pb-2 pt-1.5 justify-center relative overflow-hidden"
						style={{
							WebkitMaskImage:
								"linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
							maskImage:
								"linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
						}}
					>
						{isSpectating ? (
							<>
								<Eye className="mt-0.5" size={20} /> <span>Spectating</span>
							</>
						) : waitingForPlayers ? (
							<span>Waiting for players</span>
						) : null}
					</div>
				</TooltipTrigger>
				<TooltipContent>
					<span className="text-sm">Wait for the next match to play</span>
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
