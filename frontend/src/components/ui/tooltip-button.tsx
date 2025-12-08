import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

const MIN_VISIBLE_TIME = 2000;

export function TooltipButton({
	children,
	message,
	isError = true,
	clearMessage,
	...props
}: React.ComponentProps<typeof Button> & {
	children: React.ReactNode;
	message: string | null;
	clearMessage: () => void;
	isError?: boolean;
}) {
	const isHoveredRef = useRef(false);
	const errorShownAtRef = useRef<number>(0);
	const toClose = useRef(false);
	const [open, setOpen] = useState(true);
	const timoutRef = useRef<NodeJS.Timeout | null>(null);

	function closeMsg() {
		setOpen(false);
		setTimeout(() => {
			clearMessage();
		}, 300); // allow tooltip close animation
	}

	useEffect(() => {
		if (message) {
			setOpen(true);
			errorShownAtRef.current = Date.now();
			timoutRef.current = setTimeout(() => {
				if (!isHoveredRef.current) {
					closeMsg();
				} else {
					toClose.current = true;
				}
				timoutRef.current = null;
			}, MIN_VISIBLE_TIME);
		} else {
			if (timoutRef.current) {
				clearTimeout(timoutRef.current);
				timoutRef.current = null;
			}
		}
	}, [message, isError]);

	function handleMouseEnter() {
		isHoveredRef.current = true;
	}

	function handleMouseLeave() {
		isHoveredRef.current = false;
		if (toClose.current) {
			toClose.current = false;
			closeMsg();
		}
	}

	return (
		<Tooltip open={!!message && open}>
			<TooltipTrigger asChild>
				<Button
					{...props}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
				>
					{children}
				</Button>
			</TooltipTrigger>
			<TooltipContent
				className={`text-sm ${isError ? "text-destructive" : "text-green-300/80"}`}
			>
				{message}
			</TooltipContent>
		</Tooltip>
	);
}
