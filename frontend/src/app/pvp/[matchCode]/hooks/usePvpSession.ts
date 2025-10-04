import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";

export function usePvpSession() {
	const { matchCode } = useParams<{ matchCode: string }>();
	const isHostFromParams = useSearchParams().get("isHost") === "true";
	const [isHost, setIsHost] = useState(isHostFromParams);
	const [loading, setLoading] = useState(true);
	const [socketError, setSocketError] = useState<string | null>(null);
	const [latency, setLatency] = useState<number | null>(null);
	const [username, setUsername] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("anonymousUsername") || "";
		}
		return "";
	});
	const { data: session, isPending } = authClient.useSession();
	useEffect(() => {
		if (session?.user && !session?.user.isAnonymous) {
			const displayName =
				session.user.name ?? session.user.email?.split("@")[0] ?? "User";
			setUsername(displayName);
		} else if (!session?.user.isAnonymous) {
			authClient.signIn.anonymous();
		}
	}, [session]);

	useEffect(() => {
		if (!username || isPending) return;
		setupSocketAndJoin(username, matchCode, isHost)
			.then((response) => {
				setLoading(false);
				if (!response.success) {
					setSocketError(response.message);
				}
			})
			.catch((err) => {
				setLoading(false);
				setSocketError(`Failed to connect to server: ${err.message}`);
			});

		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:new-host": (data) => {
				if (data.socketId === socket?.id) {
					setIsHost(true);
				}
			},
		});

		const timeoutId = setInterval(async () => {
			if (socket) {
				const start = Date.now();
				await socket.emitWithAck("ping");
				const latency = Date.now() - start;
				setLatency(latency);
			}
		}, 5000);

		return () => {
			unregister();
			clearInterval(timeoutId);
			disconnectSocket();
			setLatency(null);
		};
	}, [username, isPending]);
	return {
		loading,
		socketError,
		isHost,
		username,
		setUsername,
		matchCode,
		isPending,
		latency,
	};
}
