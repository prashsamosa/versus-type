"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
	const handleLogout = async () => {
		try {
			await authClient.signOut();
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (!authClient.useSession().data?.user) {
		return null;
	}

	return (
		<Button variant="destructive" onClick={handleLogout}>
			Logout
		</Button>
	);
}
