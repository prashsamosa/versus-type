import type {
	ChatMessage,
	LobbyInfo,
	RoomType,
	WpmInfo,
} from "@versus-type/shared";
import type { GeneratorConfig } from "@versus-type/shared/passage-generator";
import { create } from "zustand";
import {
	type GameConfig,
	loadGameConfig,
	saveGameConfig,
} from "@/app/_game-config";
import { DEFAULT_KEY_BUFFER_SIZE } from "@/const";

type PvpStore = {
	players: LobbyInfo;
	setPlayers: (players: LobbyInfo) => void;
	matchStarted: boolean;
	handleStartMatch: (started: boolean) => void;
	countdown: number | null;
	handleCountdownTick: (num: number | null) => void;
	waitingCountdown: number | null;
	setWaitingCountdown: (countdown: number | null) => void;
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
	countingDown: boolean;
	setCountingDown: (started: boolean) => void;
	chatMessages: ChatMessage[];
	setChatMessages: (messages: ChatMessage[]) => void;
	addChatMessage: (message: ChatMessage) => void;
	passage: string;
	setPassage: (passage: string) => void;
	passageConfig: GeneratorConfig | null;
	setPassageConfig: (config: GeneratorConfig | null) => void;
	gameConfig: GameConfig;
	setGameConfig: (config: GameConfig) => void;
	roomType?: RoomType;
	setRoomType: (roomType: RoomType) => void;
	keyBufferSize: number;
	setKeyBufferSize: (size: number) => void;
	sidebarExpanded: boolean;
	toggleSidebar: () => void;
};

const initialState = {
	players: {},
	matchEnded: false,
	matchStarted: false,
	countdown: null,
	waitingCountdown: null,
	wpms: {},
	oppTypingIndexes: {},
	initialIndex: 0,
	passageLength: 0,
	countingDown: false,
	chatMessages: [],
	passage: "",
	passageConfig: null,
	gameConfig: loadGameConfig(),
	keyBufferSize: DEFAULT_KEY_BUFFER_SIZE,
	sidebarExpanded: false,
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
			matchEnded: false,
			countingDown: num !== null && num > 0,
			oppTypingIndexes: {},
			wpms: {},
		})),
	setWaitingCountdown: (countdown) => set({ waitingCountdown: countdown }),
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
			passage: state.passage,
			passageConfig: state.passageConfig,
			matchStarted: false,
			matchEnded: false,
			gameConfig: state.gameConfig,
			chatMessages: state.chatMessages,
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
	setGameConfig: (config) => {
		saveGameConfig(config);
		set({ gameConfig: config });
	},
	setRoomType: (roomType) => set({ roomType }),
	setKeyBufferSize: (size) => set({ keyBufferSize: size }),
	toggleSidebar: () =>
		set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
}));
