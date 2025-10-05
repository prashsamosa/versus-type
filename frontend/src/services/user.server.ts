import type { Settings, Stats } from "@versus-type/shared";
import { headers } from "next/headers";
import { API_URL } from "@/const";

export async function getUserSettings(): Promise<Settings> {
	try {
		const response = await fetch(`${API_URL}/settings`, {
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
		const response = await fetch(`${API_URL}/stats`, {
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
