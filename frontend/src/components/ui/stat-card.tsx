import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "./badge";

const ANIMATION_DURATION = 400;

function useCountUp(target: number, duration: number = ANIMATION_DURATION) {
	const [value, setValue] = useState(0);

	useEffect(() => {
		const startTime = performance.now();

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - (1 - progress) ** 3;

			setValue(target * eased);

			if (progress < 1) {
				requestAnimationFrame(animate);
			}
		}

		requestAnimationFrame(animate);
	}, [target, duration]);

	return value;
}
export function CircularProgress({
	value,
	size = 80,
	strokeWidth = 10,
}: {
	value: number;
	size?: number;
	strokeWidth?: number;
}) {
	const animatedValue = useCountUp(value);
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * 2 * Math.PI;
	const offset = circumference - (animatedValue / 100) * circumference;

	return (
		<div
			className="relative rounded-full border border-muted ring ring-muted shadow-[inset_0_2px_5px_rgba(0,0,0,0.8),inset_0_-2px_3px_rgba(0,0,0,0.6)]"
			style={{ width: size, height: size }}
		>
			<svg
				className="rotate-[-90deg] absolute inset-0"
				width={size}
				height={size}
			>
				<circle
					cx={size / 2 + 1}
					cy={size / 2 - 1}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth}
					className="text-muted/30"
				/>
				<circle
					cx={size / 2 + 1}
					cy={size / 2 - 1}
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth={strokeWidth - 5}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap="round"
					className="text-foreground/35 group-hover:text-foreground/60 transition-all"
				/>
			</svg>
			<div className="absolute inset-0 flex items-center justify-center">
				<span className="text-lg font-bold">{animatedValue.toFixed(0)}%</span>
			</div>
		</div>
	);
}

function fmtTime(mins: number) {
	mins = Math.round(mins);
	const hours = Math.floor(mins / 60);
	if (hours > 0) {
		return `${hours}h ${mins % 60}m`;
	}
	return `${mins}m`;
}

export function StatCard({
	title,
	value,
	suffix = "",
	icon: Icon,
	className = "",
	size = "default",
	tag,
	children,
	minutes,
}: {
	title?: string;
	value?: number;
	suffix?: string;
	icon?: LucideIcon;
	className?: string;
	size?: "default" | "large";
	tag?: string;
	children?: React.ReactNode;
	minutes?: boolean;
}) {
	const animatedValue = useCountUp(value ?? 0);
	const isLarge = size === "large";

	return (
		<Card
			className={`group hover:border-primary/50 transition-colors ${className}`}
		>
			<CardContent className={"h-full " + (isLarge ? "p-8" : "p-6")}>
				<div
					className={
						"flex items-center h-full " +
						(Icon ? "justify-between" : "justify-center")
					}
				>
					<div className="space-y-1">
						{tag ? (
							<Badge
								variant={"secondary"}
								className={`text-lg font-medium text-primary ${
									isLarge ? "text-sm" : "text-xs"
								}`}
							>
								{tag}
							</Badge>
						) : null}
						{title ? (
							<p
								className={`font-medium text-muted-foreground ${isLarge ? "text-xl" : "text-sm"}`}
							>
								{title}
							</p>
						) : null}
						{children ? (
							children
						) : (
							<p
								className={`font-bold tracking-tight ${isLarge ? "text-8xl" : "text-3xl"}`}
							>
								{minutes
									? fmtTime(animatedValue)
									: Math.round(animatedValue).toLocaleString()}
								{suffix && (
									<span
										className={`font-medium text-muted-foreground ml-1 ${isLarge ? "text-3xl" : "text-lg"}`}
									>
										{suffix}
									</span>
								)}
							</p>
						)}
					</div>
					{Icon ? (
						<Button
							disabled={true}
							variant="secondary"
							className={`text-primary disabled:hover:bg-secondary disabled:opacity-100 cursor-default hover:bg- group-hover:bg-primary/20 ${isLarge ? "p-10" : "p-5"}`}
						>
							<Icon className={isLarge ? "size-16" : "size-6"} />
						</Button>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}

export function ProgressStatCard({
	title,
	value,
	icon: Icon,
	className = "",
}: {
	title: string;
	value: number;
	icon: LucideIcon;
	className?: string;
}) {
	return (
		<Card
			className={`group hover:border-primary/50 transition-colors min-w-[14rem] ${className}`}
		>
			<CardContent className="p-6">
				<div className="flex items-center justify-between">
					<div className="space-y-2">
						<div className="flex items-center gap-1">
							<Icon className="size-4 text-muted-foreground" />
							<p className="font-medium text-muted-foreground">{title}</p>
						</div>
					</div>
					<CircularProgress value={value} />
				</div>
			</CardContent>
		</Card>
	);
}
