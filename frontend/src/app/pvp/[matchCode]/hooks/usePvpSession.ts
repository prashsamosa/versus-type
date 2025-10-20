import type { PlayersInfo } from "@versus-type/shared/index";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";

export const DISCONNECT_LATENCY = 6969;

export function usePvpSession() {
	const { matchCode } = useParams<{ matchCode: string }>();
	const [loading, setLoading] = useState(true);
	const [socketError, setSocketError] = useState<string | null>(null);
	const [latency, setLatency] = useState<number | null>(null);
	const [players, setPlayers] = useState<PlayersInfo>({});
	const [gameStarted, setGameStarted] = useState(false);
	const [initialIndex, setInitialIndex] = useState(0);
	const [username, setUsername] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("anonymousUsername") || "";
		}
		return "";
	});
	const { data: session, isPending } = authClient.useSession();
	const [hasSignedIn, setHasSignedIn] = useState(false);

	useEffect(() => {
		console.log("Session changed:", session);
		if (isPending) return;
		console.log("Session data:", session);
		if (session?.user && !session.user.isAnonymous) {
			const displayName =
				session.user.name ?? session.user.email?.split("@")[0] ?? "User";
			setUsername(displayName);
			return;
		} else if (!session?.user && !hasSignedIn) {
			console.log("Signing in anonymously");
			setHasSignedIn(true);
			authClient.signIn.anonymous();
		} else {
			console.log("Anonymous user");
		}
	}, [session, isPending, hasSignedIn]);

	useEffect(() => {
		if (!username || isPending) return;
		setupSocketAndJoin(username, matchCode)
			.then((response) => {
				setLoading(false);
				if (!response.success) {
					setSocketError(response.message ?? "Failed to join match");
				} else {
					setGameStarted(!!response.isStarted);
					setInitialIndex(response.typingIndex ?? 0);
				}
			})
			.catch((err) => {
				setLoading(false);
				setSocketError(`Failed to connect to server: ${err.message}`);
			});

		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:lobby-update": (players) => {
				setPlayers(players);
			},
		});

		const timeoutId = setInterval(async () => {
			if (socket) {
				const start = Date.now();
				await socket
					.timeout(4000)
					.emitWithAck("ping")
					.catch(() => {
						setLatency(DISCONNECT_LATENCY);
					});
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
		username,
		setUsername,
		matchCode,
		isPending,
		latency,
		players,
		gameStarted,
		setGameStarted,
		initialIndex,
	};
}
