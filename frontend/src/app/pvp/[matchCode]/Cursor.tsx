"use client";

export default function Cursor({
	x,
	y,
	height,
	color,
}: {
	x: number;
	y: number;
	height: number;
	color?: string;
}) {
	return (
		<span
			aria-hidden
			className="pointer-events-none absolute left-0 top-0 w-0.5 rounded bg-primary will-change-transform transition-transform duration-100 ease-out"
			style={{
				transform: `translate3d(${x}px, ${y}px, 0)`,
				height,
				backgroundColor: color,
			}}
		/>
	);
}
