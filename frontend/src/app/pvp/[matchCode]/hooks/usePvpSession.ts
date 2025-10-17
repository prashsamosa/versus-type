import type { PlayerInfo } from "@versus-type/shared/index";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";

export const DISCONNECT_LATENCY = 6969;

export function usePvpSession() {
	const { matchCode } = useParams<{ matchCode: string }>();
	const isHostFromParams = useSearchParams().get("isHost") === "true";
	const [isHost, setIsHost] = useState(isHostFromParams);
	const [loading, setLoading] = useState(true);
	const [socketError, setSocketError] = useState<string | null>(null);
	const [latency, setLatency] = useState<number | null>(null);
	const userId = authClient.useSession().data?.user.id;
	const [players, setPlayers] = useState<PlayerInfo[]>([]);
	const [username, setUsername] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("anonymousUsername") || "";
		}
		return "";
	});
	const colors = [
		// "text-blue-300",
		// "text-green-300",
		// "text-yellow-300",
		// "text-purple-300",
		// "text-pink-300",
		// "text-red-300",
		// "text-indigo-300",
		// "text-teal-300",
		"#60A5FA",
		"#34D399",
		"#FBBF24",
		"#A78BFA",
		"#F472B6",
		"#F87171",
		"#818CF8",
		"#14B8A6",
	];
	const playerColorsRef = useRef<Record<string, string>>({});
	const { data: session, isPending } = authClient.useSession();
	useEffect(() => {
		console.log("Session changed:", session);
		if (isPending) return;
		console.log("Session data:", session);
		if (session?.user && !session.user.isAnonymous) {
			const displayName =
				session.user.name ?? session.user.email?.split("@")[0] ?? "User";
			setUsername(displayName);
			return;
		} else if (!session?.user?.isAnonymous) {
			console.log("Signing in anonymously");
			authClient.signIn.anonymous();
		} else {
			console.log("Anonymous user");
		}
	}, [session, isPending]);

	useEffect(() => {
		if (!username || isPending) return;
		setupSocketAndJoin(username, matchCode, isHost)
			.then((response) => {
				setLoading(false);
				if (!response.success) {
					setSocketError(response.message ?? "Failed to join match");
				}
			})
			.catch((err) => {
				setLoading(false);
				setSocketError(`Failed to connect to server: ${err.message}`);
			});

		if (!socket) return;
		const unregister = registerSocketHandlers(socket, {
			"pvp:new-host": (data) => {
				if (data.userId === userId) {
					setIsHost(true);
				}
			},

			"pvp:lobby-update": (players) => {
				setPlayers(players);
				players.forEach((player, index) => {
					if (!playerColorsRef.current[player.userId]) {
						playerColorsRef.current[player.userId] =
							colors[index % colors.length];
					}
				});
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
		isHost,
		username,
		setUsername,
		matchCode,
		isPending,
		latency,
		players,
		playerColors: playerColorsRef.current,
	};
}
