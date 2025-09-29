import { z } from "zod";
import { API_URL } from "@/const";

const MatchStatusResponseSchema = z.object({
	matchStatus: z.enum(["notFound", "inProgress", "expired", "waiting"]),
});
type MatchStatus = "notFound" | "inProgress" | "expired" | "waiting";

export async function getMatchStatus(matchCode: string): Promise<MatchStatus> {
	try {
		const response = await fetch(`${API_URL}/pvp/match-status`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ matchCode }),
		});
		if (!response.ok) {
			throw new Error(`Error fetching match status: ${response.statusText}`);
		}
		const data = await response.json();
		const parsed = MatchStatusResponseSchema.safeParse(data);
		if (!parsed.success) {
			console.error("Validation error:", parsed.error);
			throw new Error("Invalid response format");
		}
		return parsed.data.matchStatus;
	} catch (error) {
		console.error("getMatchStatus error:", error);
		throw error;
	}
}
