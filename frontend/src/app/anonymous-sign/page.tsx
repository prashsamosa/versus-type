"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useEnsureSignedIn } from "@/app/hooks/useEnsureSignedIn";

export default function AnonymousSignPage() {
	const searchParams = useSearchParams();
	const { authResolved } = useEnsureSignedIn();
	const from = searchParams.get("from") || "/";

	useEffect(() => {
		if (authResolved) {
			// router.replace(from) doesn't work on soft navigation idk why
			window.location.replace(from);
		}
	}, [authResolved, from]);

	return (
		<div className="flex flex-col items-center justify-center min-h-screen gap-4">
			<div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
			<p className="text-xl text-muted-foreground">Signing in as Guest</p>
		</div>
	);
}
