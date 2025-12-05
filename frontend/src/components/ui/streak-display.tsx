import { useEffect, useRef } from "react";

const STREAK_MIN = 5;
const STREAK_FIRE_MIN = 15;

export function StreakDisplay({ streak }: { streak: number }) {
	const prevStreakRef = useRef(streak);
	const show = streak >= STREAK_MIN;
	const showFire = streak >= STREAK_FIRE_MIN;

	useEffect(() => {
		prevStreakRef.current = streak;
	}, [streak]);

	return (
		<div
			className={
				"relative text-right transition font-mono " +
				(show ? "w-24 opacity-100" : "w-0 opacity-0")
			}
		>
			<img
				src="/flame.gif"
				alt="fire"
				className={
					"absolute -z-10 -top-9 -right-4.5 transition h-16 w-24 duration-300 " +
					(showFire ? "opacity-20" : "opacity-0 scale-0")
				}
			/>
			<div
				className={`absolute animate-streak-up text-right right-4 -top-1`}
				key={streak}
			>
				{show ? streak : prevStreakRef.current}
				<span className="text-foreground/50">x</span>
			</div>
		</div>
	);
}
