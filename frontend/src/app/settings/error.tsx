"use client";

import { Button } from "@/components/ui/button";

export default function Page({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	return (
		<div className="container max-w-2xl mx-auto py-8">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Settings</h1>
				</div>
				<div className="text-destructive">
					<pre>{error.message}</pre>
					<Button onClick={reset}>Try again</Button>
				</div>
			</div>
		</div>
	);
}
