"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEnsureSignedIn } from "@/app/hooks/useEnsureSignedIn";

export default function AnonymousSignPage() {
	const searchParams = useSearchParams();
	const { authResolved } = useEnsureSignedIn();
	const router = useRouter();
	const from = searchParams.get("from") || "/";

	if (typeof window !== "undefined") {
		if (authResolved) router.replace(from);
	}

	return (
		<div className="h-screen flex items-center justify-center p-4">
			<h1 className="text-4xl font-bold text-center">Signing in as Guest...</h1>
		</div>
	);
}
