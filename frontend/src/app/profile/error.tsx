"use client";

export default function ProfileError({ error }: { error: Error }) {
	return (
		<div className="container max-w-6xl mx-auto py-8">
			<h1 className="text-4xl font-bold text-center">Error Loading Profile</h1>
			<p className="text-center mt-4">{error.message}</p>
		</div>
	);
}
