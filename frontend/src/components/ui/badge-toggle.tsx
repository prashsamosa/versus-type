import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function BadgeToggle({
	enabled,
	onToggle,
	children,
	className,
}: {
	enabled: boolean;
	onToggle: (enabled: boolean) => void;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			onClick={() => onToggle(!enabled)}
			className={cn(
				"hover:bg-card cursor-pointer text-sm flex justify-center items-center gap-1 px-2 py-1.5 rounded-md inset-ring-input " +
					(enabled ? "inset-ring-1" : "inset-ring-0 text-muted-foreground"),
				className,
			)}
		>
			{enabled ? <Check className="size-3.5" /> : <X className="size-3.5" />}
			{children}
		</div>
	);
}
