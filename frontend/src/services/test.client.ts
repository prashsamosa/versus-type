import type { Settings, TestStats } from "@brawltype/types";

const url = "http://localhost:3001/api/test";
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
