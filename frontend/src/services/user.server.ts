import { Settings, Stats } from "@brawltype/types";
import { headers } from "next/headers";

const url = "http://localhost:3001/api/user";
export async function getUserSettings(): Promise<Settings> {
	try {
		const response = await fetch(`${url}/settings`, {
			headers: await headers(),
		});
		if (!response.ok) {
			throw new Error(`Error fetching user settings: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to fetch user settings:", error);
		throw error;
	}
}

export async function getUserStats(): Promise<Stats> {
	try {
		const response = await fetch(`${url}/stats`, {
			headers: await headers(),
		});
		if (!response.ok) {
			throw new Error(`Error fetching user stats: ${response.statusText}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to fetch user stats:", error);
		throw error;
	}
}
