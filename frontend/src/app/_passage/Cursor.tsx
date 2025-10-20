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
				transform: `translate(${x}px, ${y + 3}px)`,
				height: "2em",
				backgroundColor: color,
				opacity: disabled ? 0.5 : 1,
				boxShadow: glow
					? // ? `0 0 8px 2px ${color || "var(--destructive)"}`
						`0 0 8px 0.5px var(--destructive)`
					: undefined,
			}}
		/>
	);
}
