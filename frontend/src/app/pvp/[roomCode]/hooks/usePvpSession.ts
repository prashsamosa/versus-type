import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
	const [username, setUsername] = useState("");
	const { data: session, isPending } = authClient.useSession();
	const [authResolved, setAuthResolved] = useState(false);
	const signingIn = useRef(false);
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
	const setRoomType = usePvpStore((s) => s.setRoomType);
	const setWaitingCountdown = usePvpStore((s) => s.setWaitingCountdown);

	useEffect(() => {
		if (isPending) return;

		if (session?.user && !session.user.isAnonymous) {
			const displayName =
				session.user.name ?? session.user.email?.split("@")[0] ?? "User";
			setUsername(displayName);
			setAuthResolved(true);
			return;
		}

		if (!session?.user && !signingIn.current) {
			signingIn.current = true;
			authClient.signIn.anonymous().then((result) => {
				if (result.data?.user) {
					const name =
						result.data.user.name === "Anonymous" ? "" : result.data.user.name;
					setUsername(name);
					setAuthResolved(true);
				}
			});
			return;
		}

		if (session?.user?.isAnonymous) {
			const name = session.user.name === "Anonymous" ? "" : session.user.name;
			setUsername(name);
			setAuthResolved(true);
		}
	}, [session, isPending]);

	useEffect(() => {
		if (!authResolved || !username) return;
		setupSocketAndJoin(username, roomCode)
			.then((response) => {
				setLoading(false);
				if (!response.success) {
					setSocketError(response.message ?? "Failed to join match");
				} else {
					if (!response.gameState) return;
					const gameState = response.gameState;

					handleStartMatch(!!gameState.isStarted);

					setInitialIndex(gameState.typingIndex ?? 0);

					if (gameState.isStarted && gameState.oppTypingIndexes)
						setOppTypingIndexes(gameState.oppTypingIndexes);
					if (gameState.chatHistory) setChatMessages(gameState.chatHistory);
					if (gameState.passage) setPassage(gameState.passage);
					if (gameState.passageConfig)
						setPassageConfig(gameState.passageConfig);
					if (gameState.type) setRoomType(gameState.type);
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
			},
			disconnect: () => {
				setDisconnected(true);
			},
			"pvp:match-ended": () => {
				endMatch();
			},
			"pvp:waiting-countdown": (countdown) => {
				setWaitingCountdown(countdown);
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
	}, [username, authResolved, setWpms]);
	return {
		loading,
		socketError,
		username,
		setUsername,
		roomCode,
		authResolved,
		latency,
		players,
		matchStarted,
		initialIndex,
		disconnected,
	};
}
