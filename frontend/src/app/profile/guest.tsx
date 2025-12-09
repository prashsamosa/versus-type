"use client";

import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

export function GuestMessage() {
	const user = authClient.useSession().data?.user;
	const isGuest = user ? user.isAnonymous : true;
	if (!isGuest) return null;
	return <Badge>Guest</Badge>;
}
