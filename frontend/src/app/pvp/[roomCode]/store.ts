import type { LobbyInfo, WpmInfo } from "@versus-type/shared";
import { create } from "zustand";

type PvpStore = {
	players: LobbyInfo;
	setPlayers: (players: LobbyInfo) => void;
	gameStarted: boolean;
	handleStartGame: (started: boolean) => void;
	countdown: number | null;
	handleCountdownTick: (num: number | null) => void;
	wpms: WpmInfo;
	setWpms: (wpms: WpmInfo) => void;
	oppTypingIndexes: Record<string, number>;
	setOppTypingIndexes: (indexes: Record<string, number>) => void;
	updateOppTypingIndex: (userId: string, index: number) => void;
	initialIndex: number;
	setInitialIndex: (index: number) => void;
	passageLength: number;
	setPassageLength: (length: number) => void;
	matchEnded: boolean;
	endMatch: () => void;
	initializeNextMatchState: () => void;
	matchesPlayed: number;
	countingDown: boolean;
	setCountingDown: (started: boolean) => void;
};

const initialState = {
	players: {},
	matchEnded: false,
	gameStarted: false,
	countdown: null,
	wpms: {},
	oppTypingIndexes: {},
	initialIndex: 0,
	passageLength: 0,
	matchesPlayed: 0,
	countingDown: false,
} satisfies Partial<PvpStore>;
// why 'satisfies' instead of type annotation? Coz TS magic: type annotation infers this type to initialState, which makes TS cry later when we spread initialState in create. Using satisfies doesn't infer the type, and we get sexy autocomplete.

export const usePvpStore = create<PvpStore>((set) => ({
	...initialState,
	setPlayers: (players) => set({ players }),
	handleStartGame: (started) =>
		set({ gameStarted: started, countdown: null, countingDown: false }),
	handleCountdownTick: (num) =>
		set((state) => ({
			countdown: num === 0 ? null : num,
			gameStarted: num === 0 ? true : state.gameStarted,
		})),
	setWpms: (wpms) => set({ wpms }),
	setOppTypingIndexes: (indexes) => set({ oppTypingIndexes: indexes }),
	updateOppTypingIndex: (userId, index) =>
		set((state) => ({
			oppTypingIndexes: { ...state.oppTypingIndexes, [userId]: index },
		})),
	setInitialIndex: (index) => set({ initialIndex: index }),
	setPassageLength: (length) => set({ passageLength: length }),
	endMatch: () =>
		set({
			matchEnded: true,
			gameStarted: false,
			countdown: null,
			countingDown: false,
		}),
	initializeNextMatchState: () =>
		set((state) => ({
			...initialState,
			players: state.players,
			gameStarted: false,
			matchEnded: false,
		})),
	setCountingDown: (started) => set({ countingDown: started }),
}));
