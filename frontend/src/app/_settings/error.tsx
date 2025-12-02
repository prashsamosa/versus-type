"use client";

export default function Page({ error }: { error: Error; reset: () => void }) {
	return (
		<div className="container max-w-2xl mx-auto py-8">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Settings</h1>
				</div>
				<div className="text-destructive">
					<pre>{error.message}</pre>
				</div>
			</div>
		</div>
	);
}
