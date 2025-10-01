import { API_URL } from "@/const";

export async function hostMatch(isPrivate: boolean) {
	try {
		const response = await fetch(`${API_URL}/pvp/host`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ private: isPrivate }),
		});
		if (!response.ok) {
			throw new Error(`Error fetching match status: ${response.statusText}`);
		}
		const data = await response.json();
		const matchCode = data.matchCode;
		if (typeof matchCode !== "string") {
			console.error("Validation error: matchCode is not a string");
			throw new Error("Internal server error");
		}
		return matchCode;
	} catch (error) {
		console.error("hostMatch error:", error);
		throw error;
	}
}
