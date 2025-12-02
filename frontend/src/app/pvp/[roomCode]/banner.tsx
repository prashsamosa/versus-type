import { Eye } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Odometer } from "./Odometer";
import { usePvpStore } from "./store";

export function Banner({
	isSpectating,
	waitingForPlayers,
}: {
	isSpectating: boolean;
	waitingForPlayers: boolean;
}) {
	const waitingCountdown = usePvpStore((s) => s.waitingCountdown);
	return (
		<Tooltip>
			<TooltipTrigger className="cursor-default">
				<div
					className={`text-xl duration-500 text-foreground opacity-70 flex items-center gap-2 bg-input/60 border px-10 pb-2 pt-1.5 justify-center relative overflow-hidden transition-all ${isSpectating || waitingForPlayers ? "h-12" : "h-0"}`}
					style={{
						WebkitMaskImage:
							"linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
						maskImage:
							"linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
					}}
				>
					<div
						className={
							"overflow-hidden transition-all " +
							(isSpectating ? "max-w-xl" : "max-w-0 delay-1000")
						}
					>
						<Eye className="mt-0.5" size={20} /> <span>Spectating</span>
					</div>
					<span
						className={
							"overflow-hidden flex gap-3 items-center transition-all " +
							(waitingForPlayers ? "max-w-xl" : "max-w-0 delay-1000")
						}
					>
						Waiting for players
						{waitingCountdown !== null && (
							<div className="mt-1">
								{" "}
								<Odometer value={waitingCountdown} />
							</div>
						)}
					</span>
				</div>
			</TooltipTrigger>
			{isSpectating ? (
				<TooltipContent>
					<span className="text-sm">Wait for the next match to play</span>
				</TooltipContent>
			) : null}
		</Tooltip>
	);
}
