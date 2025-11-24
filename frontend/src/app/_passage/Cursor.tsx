"use client";

export default function Cursor({
	x,
	y,
	color,
	disabled,
	redGlow,
	dim,
}: {
	x: number;
	y: number;
	color?: string;
	disabled?: boolean;
	redGlow?: boolean;
	dim?: boolean;
}) {
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute left-0 top-0 rounded bg-primary will-change-transform transition duration-100 ease-out"
			style={{
				transform: `translate(${x - 2}px, ${y + 3}px)`,
				height: "2em",
				width: dim ? "2px" : "2.5px",
				backgroundColor: color,
				opacity: dim ? 0.6 : 1,
				filter: disabled ? "blur(2px)" : undefined,
				boxShadow: redGlow ? `0 0 8px 0.3px var(--destructive)` : undefined,
			}}
		/>
	);
}
