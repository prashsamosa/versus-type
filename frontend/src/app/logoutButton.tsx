"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
	const handleLogout = async () => {
		try {
			localStorage.removeItem("anonymousUsername");
			await authClient.signOut();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};
	const user = authClient.useSession().data?.user;

	if (!user || user.isAnonymous) {
		return null;
	}

	return (
		<Button variant="secondary" onClick={handleLogout}>
			Logout
		</Button>
	);
}
