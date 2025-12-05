import type { SoloStats } from "@versus-type/shared";
import { API_URL } from "@/const";

export async function completeSoloMatch(data: SoloStats): Promise<boolean> {
	try {
		const response = await fetch(`${API_URL}/solo`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			const errMsg =
				(await response.json().catch(() => ({})))?.error || response.statusText;
			throw new Error(errMsg);
		}
		const result = await response.json();
		return result.isNewHighest || false;
	} catch (error) {
		console.error("Error saving result", error);
		throw error;
	}
}
