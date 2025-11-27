import type { ChatMessage, LobbyInfo, WpmInfo } from "@versus-type/shared";
import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { create } from "zustand";

type PvpStore = {
	players: LobbyInfo;
	setPlayers: (players: LobbyInfo) => void;
	matchStarted: boolean;
	handleStartMatch: (started: boolean) => void;
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
	resetStore: () => void;
	matchesPlayed: number;
	countingDown: boolean;
	setCountingDown: (started: boolean) => void;
	chatMessages: ChatMessage[];
	setChatMessages: (messages: ChatMessage[]) => void;
	addChatMessage: (message: ChatMessage) => void;
	passage: string;
	setPassage: (passage: string) => void;
	passageConfig: GeneratorConfig | null;
	setPassageConfig: (config: GeneratorConfig | null) => void;
};

const initialState = {
	players: {},
	matchEnded: false,
	matchStarted: false,
	countdown: null,
	wpms: {},
	oppTypingIndexes: {},
	initialIndex: 0,
	passageLength: 0,
	matchesPlayed: 0,
	countingDown: false,
	chatMessages: [],
	passage: "",
	passageConfig: null,
} satisfies Partial<PvpStore>;
// why 'satisfies' instead of type annotation? Coz TS magic: type annotation infers this type to initialState, which makes TS cry later when we spread initialState in create. Using satisfies doesn't infer the type, and we get sexy autocomplete.

export const usePvpStore = create<PvpStore>((set) => ({
	...initialState,
	setPlayers: (players) => set({ players }),
	handleStartMatch: (started) =>
		set({ matchStarted: started, countdown: null, countingDown: false }),
	handleCountdownTick: (num) =>
		set((state) => ({
			countdown: num === 0 ? null : num,
			matchStarted: num === 0 ? true : state.matchStarted,
			countingDown: num !== null && num > 0,
			oppTypingIndexes: {},
			wpms: {},
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
			matchStarted: false,
			countdown: null,
			countingDown: false,
		}),
	initializeNextMatchState: () =>
		set((state) => ({
			...initialState,
			matchStarted: false,
			matchEnded: false,
			players: Object.entries(state.players).reduce((acc, [userId, player]) => {
				acc[userId] = {
					...player,
					typingIndex: 0,
					finished: false,
					accuracy: undefined,
					ordinal: undefined,
					wpm: undefined,
				};
				return acc;
			}, {} as LobbyInfo),
		})),
	setCountingDown: (started) => set({ countingDown: started }),
	resetStore: () => set(initialState),
	setChatMessages: (messages) => set({ chatMessages: messages }),
	addChatMessage: (message) =>
		set((state) => ({ chatMessages: [...state.chatMessages, message] })),
	setPassage: (passage) => set({ passage, passageLength: passage.length }),
	setPassageConfig: (config) => set({ passageConfig: config }),
}));
