import type { Settings, TestStats } from "@versus-type/types";
import { url } from "./const";

export async function completeTest(data: TestStats): Promise<Settings> {
	try {
		const response = await fetch(`${url}/`, {
			method: "POST",
			credentials: "include",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});
		if (!response.ok) {
			throw new Error(`Error saving result ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Error saving result", error);
		throw error;
	}
}
