"use client";

import Passage from "./Passage";

export default function SoloPage() {
	return (
		<div className="bg-background flex items-center justify-center min-h-screen py-2">
			<Passage burstEffect={true} />
		</div>
	);
}
