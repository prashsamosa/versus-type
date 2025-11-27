import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { registerSocketHandlers } from "@/lib/registerSocketHandlers";
import { disconnectSocket, setupSocketAndJoin, socket } from "@/socket";
import { usePvpStore } from "../store";

export function usePvpSession() {
	const { roomCode } = useParams<{ roomCode: string }>();
	const [loading, setLoading] = useState(true);
	const [socketError, setSocketError] = useState<string | null>(null);
	const [latency, setLatency] = useState<number | null>(null);
	const [disconnected, setDisconnected] = useState(false);
	const [username, setUsername] = useState(() => {
		if (typeof window !== "undefined") {
			return localStorage.getItem("anonymousUsername") || "";
		}
		return "";
	});
	const { data: session, isPending } = authClient.useSession();
	const [hasSignedIn, setHasSignedIn] = useState(false);
	const endMatch = usePvpStore((s) => s.endMatch);

	const setPlayers = usePvpStore((s) => s.setPlayers);
	const handleStartMatch = usePvpStore((s) => s.handleStartMatch);
	const setInitialIndex = usePvpStore((s) => s.setInitialIndex);
	const setWpms = usePvpStore((s) => s.setWpms);
	const players = usePvpStore((s) => s.players);
	const matchStarted = usePvpStore((s) => s.matchStarted);
	const initialIndex = usePvpStore((s) => s.initialIndex);
	const setOppTypingIndexes = usePvpStore((s) => s.setOppTypingIndexes);
	const setChatMessages = usePvpStore((s) => s.setChatMessages);
	const setPassage = usePvpStore((s) => s.setPassage);
	const setPassageConfig = usePvpStore((s) => s.setPassageConfig);
	const matchEnded = usePvpStore((s) => s.matchEnded);

	useEffect(() => {
		if (isPending) return;
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
		setupSocketAndJoin(username, roomCode)
			.then((response) => {
				setLoading(false);
				if (!response.success) {
					setSocketError(response.message ?? "Failed to join match");
				} else {
					handleStartMatch(!!response.isStarted);
					setInitialIndex(response.typingIndex ?? 0);
					if (response.isStarted && response.oppTypingIndexes)
						setOppTypingIndexes(response.oppTypingIndexes);
					if (response.chatHistory) setChatMessages(response.chatHistory);
					if (response.passage) setPassage(response.passage);
					if (response.passageConfig) setPassageConfig(response.passageConfig);
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
			"pvp:wpm-update": (data) => {
				setWpms(data);
			},
			"passage:put": (passage, passageConfig) => {
				setPassage(passage);
				setPassageConfig(passageConfig);
				if (matchEnded) {
				}
			},
			disconnect: () => {
				setDisconnected(true);
			},
			"pvp:match-ended": () => {
				endMatch();
			},
		});
		async function fetchLatency() {
			if (socket) {
				const start = Date.now();
				await socket
					.timeout(4000)
					.emitWithAck("ping")
					.catch(() => {});
				const latency = Date.now() - start;
				setLatency(latency);
			}
		}
		fetchLatency();
		const timeoutId = setInterval(fetchLatency, 5000);

		return () => {
			unregister();
			clearInterval(timeoutId);
			disconnectSocket();
			setLatency(null);
		};
	}, [username, isPending, setWpms]);
	return {
		loading,
		socketError,
		username,
		setUsername,
		roomCode,
		isPending,
		latency,
		players,
		matchStarted,
		initialIndex,
		disconnected,
	};
}
