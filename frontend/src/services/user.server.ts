import type { UserStats } from "@versus-type/shared";
import { headers } from "next/headers";
import { API_URL } from "@/const";

// export async function getUserSettings(): Promise<Settings> {
// 	try {
// 		console.log(
// 			"trying to fetch user settings from",
// 			`${API_URL}/user/settings`,
// 		);
// 		const response = await fetch(`${API_URL}/user/settings`, {
// 			headers: await headers(),
// 			credentials: "include",
// 		});
// 		if (!response.ok) {
// 			const errMsg =
// 				(await response.json().catch(() => ({})))?.error ||
// 				response.status + response.statusText;
// 			throw new Error(`Error fetching user settings: ${errMsg}`);
// 		}
// 		return await response.json();
// 	} catch (error) {
// 		console.error("Failed to fetch user settings:", error);
// 		throw error;
// 	}
// }

export async function getUserStats(): Promise<UserStats> {
	try {
		const headersList = await headers();
		const cookie = headersList.get("cookie");
		const response = await fetch(`${API_URL}/user/stats`, {
			headers: cookie ? { cookie } : {},
			credentials: "include",
		});
		if (!response.ok) {
			const errMsg =
				(await response.json().catch(() => ({})))?.error || response.statusText;
			throw new Error(`Error fetching user stats: ${errMsg}`);
		}
		return await response.json();
	} catch (error) {
		console.error("Failed to fetch user stats:", error);
		throw error;
	}
}
