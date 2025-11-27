import { cn } from "@/lib/utils";

export function SexyCard({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"h-full p-0 gap-0 relative rounded-xl overflow-hidden border",
				"shadow-[inset_0_3px_4px_rgba(255,255,255,0.03),0_2px_4px_rgba(0,0,0,0.3),0_4px_8px_rgba(0,0,0,0.1)]",
				className,
			)}
			{...props}
		/>
	);
}

export function SexyCardContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"flex flex-col px-4 py-2 gap-2 overflow-y-auto overflow-x-hidden h-full bg-card2",
				"shadow-[inset_0_6px_4px_rgba(0,0,0,0.35)]",
				className,
			)}
			{...props}
		/>
	);
}

export function SexyCardHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"py-2 px-4 flex justify-between items-center text-md text-foreground/80 font-semibold shadow-[inset_0_2px_3px_rgba(255,255,255,0.03)]",
				"border-b",
				"bg-cardheader",
				className,
			)}
			{...props}
		/>
	);
}
