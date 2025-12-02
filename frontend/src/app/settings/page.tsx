import { getUserSettings } from "@/services/user.server";
import { SettingsForm } from "./form";

export default async function SettingsPage() {
	const settingsData = await getUserSettings();
	return <SettingsForm settingsData={settingsData} />;
}
