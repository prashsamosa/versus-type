import type { Settings } from "@versus-type/shared";
import { SettingsSchema } from "@versus-type/shared";
import { API_URL } from "@/const";

export async function updateUserSettings(settings: Settings) {
	SettingsSchema.parse(settings);
	try {
		const response = await fetch(`${API_URL}/settings`, {
			method: "PATCH",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(settings),
		});
		if (!response.ok) {
			const errMsg =
				(await response.json().catch())?.error || response.statusText;
			throw new Error(`Error updating user settings: ${errMsg}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to update user settings:", error);
		throw error;
	}
}
