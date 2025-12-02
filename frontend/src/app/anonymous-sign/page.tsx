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
		<div className="h-screen flex items-center justify-center p-4">
			<h1 className="text-4xl font-bold text-center">Signing in as Guest...</h1>
		</div>
	);
}
