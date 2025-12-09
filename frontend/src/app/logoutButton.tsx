"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
	const handleLogout = async () => {
		try {
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
		<Button variant="ghost" onClick={handleLogout}>
			<LogOut className="size-4" />
			Logout
		</Button>
	);
}
