import type { LobbyInfo, WpmInfo } from "@versus-type/shared";
import { create } from "zustand";

type PvpStore = {
	players: LobbyInfo;
	setPlayers: (players: LobbyInfo) => void;
	gameStarted: boolean;
	setGameStarted: (started: boolean) => void;
	countdown: number | null;
	setCountdown: (num: number | null) => void;
	wpms: WpmInfo;
	setWpms: (wpms: WpmInfo) => void;
	oppTypingIndexes: Record<string, number>;
	setOppTypingIndexes: (indexes: Record<string, number>) => void;
	updateOppTypingIndex: (userId: string, index: number) => void;
	initialIndex: number;
	setInitialIndex: (index: number) => void;
	passageLength: number;
	setPassageLength: (length: number) => void;
};

export const usePvpStore = create<PvpStore>((set) => ({
	players: {},
	setPlayers: (players) => set({ players }),
	gameStarted: false,
	setGameStarted: (started) => set({ gameStarted: started }),
	countdown: null,
	setCountdown: (num) => set({ countdown: num }),
	wpms: {},
	setWpms: (wpms) => set({ wpms }),
	oppTypingIndexes: {},
	setOppTypingIndexes: (indexes) => set({ oppTypingIndexes: indexes }),
	updateOppTypingIndex: (userId, index) =>
		set((state) => ({
			oppTypingIndexes: { ...state.oppTypingIndexes, [userId]: index },
		})),
	initialIndex: 0,
	setInitialIndex: (index) => set({ initialIndex: index }),
	passageLength: 0,
	setPassageLength: (length) => set({ passageLength: length }),
}));
