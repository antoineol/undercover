import { create } from "zustand";

interface SessionState {
  sessionId: string | null;
}

interface SessionActions {
  setSession: (sessionId: string) => void;
  clearSession: () => void;
}

const initialState: SessionState = {
  sessionId: null,
};

const saveToSessionStorage = (sessionId: string | null) => {
  if (typeof window === "undefined") return;

  if (sessionId) {
    sessionStorage.setItem("player_session", sessionId);
  } else {
    sessionStorage.removeItem("player_session");
  }
};

const loadFromSessionStorage = (): string | null => {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("player_session");
};

export const useSessionStore = create<SessionState & SessionActions>()(
  (set) => ({
    sessionId: loadFromSessionStorage(),

    setSession: (sessionId) => {
      set({ sessionId });
      saveToSessionStorage(sessionId);
    },

    clearSession: () => {
      set(initialState);
      saveToSessionStorage(null);
    },
  }),
);
