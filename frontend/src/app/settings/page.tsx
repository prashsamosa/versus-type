import { Suspense } from "react";
import { SettingsForm } from "./form";
import { getUserSettings } from "@/services/user.server";

export default function SettingsPage() {
	const settingsData = getUserSettings();
	return (
		<Suspense fallback={<div>Loading settings...</div>}>
			<SettingsForm settingsData={settingsData} />
		</Suspense>
	);
}
