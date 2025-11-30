import type { Settings, TestStats } from "@versus-type/shared";
import { API_URL } from "@/const";

export async function completeTest(data: TestStats): Promise<Settings> {
	try {
		const response = await fetch(`${API_URL}/`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const errMsg =
				(await response.json().catch())?.error || response.statusText;
			throw new Error(`Error saving result: ${errMsg}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error saving result", error);
		throw error;
	}
}
