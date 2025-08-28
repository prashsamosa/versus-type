import { Suspense } from "react";
import { getUserSettings } from "@/services/user.server";
import { SettingsForm } from "./form";

export default function SettingsPage() {
	const settingsData = getUserSettings();
	return (
		<Suspense fallback={<div>Loading settings...</div>}>
			<SettingsForm settingsData={settingsData} />
		</Suspense>
	);
}
