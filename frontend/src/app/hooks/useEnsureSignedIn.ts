import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function useEnsureSignedIn(trigger: boolean = true) {
	const { data: session, isPending } = authClient.useSession();
	const [authResolved, setAuthResolved] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const signingIn = useRef(false);

	useEffect(() => {
		if (isPending || !trigger) return;

		if (session?.user && !session.user.isAnonymous) {
			setAuthResolved(true);
			return;
		}

		if (!session?.user && !signingIn.current) {
			signingIn.current = true;
			authClient.signIn
				.anonymous()
				.then((result) => {
					if (result.data?.user) setAuthResolved(true);
				})
				.catch((err) => {
					setError(err);
				});
		}

		if (session?.user?.isAnonymous) {
			setAuthResolved(true);
		}
		console.log(error);
	}, [session, isPending]);

	return {
		error,
		authResolved,
	};
}
