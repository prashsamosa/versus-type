export function Header({ children }: { children: React.ReactNode }) {
	return (
		<div className="w-full pointer-events-none absolute p-5 text-center font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-background from-30% to-90% hidden md:block md:text-4xl lg:text-5xl">
			{children}
		</div>
	);
}
