"use client";

export default function Cursor({
	x,
	y,
	color,
	disabled,
	glow,
}: {
	x: number;
	y: number;
	color?: string;
	disabled?: boolean;
	glow?: boolean;
}) {
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute left-0 top-0 w-0.5 rounded bg-primary will-change-transform transition duration-100 ease-out"
			style={{
				transform: `translate(${x - 2}px, ${y + 3}px)`,
				height: "2em",
				backgroundColor: color,
				// opacity: disabled ? 0.5 : 1,
				filter: disabled ? "blur(2px)" : undefined,
				boxShadow: glow ? `0 0 8px 0.3px var(--destructive)` : undefined,
			}}
		/>
	);
}
