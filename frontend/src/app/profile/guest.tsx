"use client";

import { Badge } from "@/components/ui/badge";
import { authClient } from "@/lib/auth-client";

export function GuestMessage() {
	const isGuest = authClient.useSession().data?.user.isAnonymous ?? true;
	if (!isGuest) return null;
	return <Badge>Guest</Badge>;
}
