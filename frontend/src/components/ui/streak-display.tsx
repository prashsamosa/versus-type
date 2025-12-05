import { Activity, useEffect, useRef } from "react";

export function StreakDisplay({ streak }: { streak: number }) {
	const prevStreakRef = useRef(streak);
	const show = streak >= 5;
	const showFire = streak >= 10;

	useEffect(() => {
		prevStreakRef.current = streak;
	}, [streak]);

	if (!show) return null;

	return (
		<div className="relative w-24">
			<Activity mode={showFire ? "visible" : "hidden"}>
				<img
					src="/flame.gif"
					alt="fire"
					className="absolute -z-10 -top-8 -left-9 opacity-20 h-16 w-24 animate-fire-in"
				/>
			</Activity>
			<div className={`absolute animate-streak-up`} key={streak}>
				{show ? streak : prevStreakRef.current}
				<span className="text-foreground/50">x</span>
			</div>
		</div>
	);
}
