import { create } from "zustand";

interface SessionState {
  sessionId: string | null;
}

interface SessionActions {
  setSession: (sessionId: string) => void;
  clearSession: () => void;
  loadFromSessionStorage: () => void;
  saveToSessionStorage: () => void;
}

const initialState: SessionState = {
  sessionId: null,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  (set, get) => ({
    ...initialState,
    setSession: (sessionId) => set({ sessionId }),
    clearSession: () => set(initialState),

    loadFromSessionStorage: () => {
      try {
        const savedData = sessionStorage.getItem("player_session");
        if (savedData) {
          const parsedData = JSON.parse(savedData) as { sessionId: string };
          set({
            sessionId: parsedData.sessionId,
          });
        }
      } catch (error) {
        console.error("Error loading session from sessionStorage:", error);
        sessionStorage.removeItem("player_session");
      }
    },

    saveToSessionStorage: () => {
      const state = get();
      if (state.sessionId) {
        const sessionData = {
          sessionId: state.sessionId,
        };
        sessionStorage.setItem("player_session", JSON.stringify(sessionData));
      }
    },
  }),
);
