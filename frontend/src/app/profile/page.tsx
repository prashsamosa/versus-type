import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { UsernameForm } from "../pvp/[roomCode]/UsernameForm";
import { GuestMessage } from "./guest";
import { StatsView } from "./stats";

export default function ProfilePage() {
	return (
		<div className="container max-w-6xl mx-auto py-8">
			<div className="space-y-8">
				<div className="text-center space-y-2">
					<h1 className="text-4xl font-bold">Profile</h1>
					<GuestMessage />
				</div>
				<Separator />
				<UsernameForm />
				<Suspense fallback={<div>Loading stats...</div>}>
					<StatsView />
				</Suspense>
			</div>
		</div>
	);
}
