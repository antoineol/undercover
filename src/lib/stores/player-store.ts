import { create } from 'zustand';

interface PlayerState {
  playerName: string;
  isHost: boolean;
  sessionId: string | null;
  roomCode: string | null;
}

interface PlayerActions {
  setPlayer: (player: Partial<PlayerState>) => void;
  clearPlayer: () => void;
  setRoomCode: (roomCode: string) => void;
  loadFromSessionStorage: (roomCode: string) => void;
  saveToSessionStorage: (roomCode: string) => void;
}

const initialState: PlayerState = {
  playerName: '',
  isHost: false,
  sessionId: null,
  roomCode: null,
};

export const usePlayerStore = create<PlayerState & PlayerActions>()(
  (set, get) => ({
    ...initialState,
    setPlayer: player => set(state => ({ ...state, ...player })),
    clearPlayer: () => set(initialState),
    setRoomCode: roomCode => set({ roomCode }),

    loadFromSessionStorage: (roomCode: string) => {
      try {
        const savedData = sessionStorage.getItem(`player_${roomCode}`);
        if (savedData) {
          const parsedData = JSON.parse(savedData) as {
            playerName: string;
            isHost: boolean;
            sessionId: string;
          };
          set({
            playerName: parsedData.playerName,
            isHost: parsedData.isHost,
            sessionId: parsedData.sessionId,
            roomCode,
          });
        }
      } catch (error) {
        console.error('Error loading player data from sessionStorage:', error);
        sessionStorage.removeItem(`player_${roomCode}`);
      }
    },

    saveToSessionStorage: (roomCode: string) => {
      const state = get();
      if (state.playerName && state.sessionId) {
        const playerData = {
          playerName: state.playerName,
          isHost: state.isHost,
          sessionId: state.sessionId,
        };
        sessionStorage.setItem(
          `player_${roomCode}`,
          JSON.stringify(playerData)
        );
      }
    },
  })
);
