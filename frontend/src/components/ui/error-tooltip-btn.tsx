import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

export function ErrorTooltipBtn({
	children,
	error,
	setError,
	...props
}: React.ComponentProps<typeof Button> & {
	children: React.ReactNode;
	error: string | null;
	setError: (error: string | null) => void;
}) {
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
	const isHoveredRef = useRef(false);
	const errorShownAtRef = useRef<number>(0);
	const [open, setOpen] = useState(true);

	useEffect(() => {
		if (error) {
			errorShownAtRef.current = Date.now();
		}
	}, [error]);

	useEffect(() => {
		return () => clearTimeout(timeoutRef.current);
	}, []);

	function handleMouseEnter() {
		setOpen(true);
		isHoveredRef.current = true;
		clearTimeout(timeoutRef.current);
	}

	function handleMouseLeave() {
		isHoveredRef.current = false;
		const timeVisible = Date.now() - errorShownAtRef.current;

		if (timeVisible < 1000) {
			timeoutRef.current = setTimeout(() => {
				if (!isHoveredRef.current) {
					setOpen(false);
				}
			}, 2000 - timeVisible);
		} else {
			setError(null);
		}
	}

	return (
		<Tooltip open={!!error && open}>
			<TooltipTrigger asChild>
				<Button
					{...props}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent className="text-destructive text-sm">
				{error}
			</TooltipContent>
		</Tooltip>
	);
}
