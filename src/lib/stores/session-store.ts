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

// Helper function to save to session storage
const saveToSessionStorage = (sessionId: string | null) => {
  if (typeof window === "undefined") return;

  if (sessionId) {
    const sessionData = { sessionId };
    sessionStorage.setItem("player_session", JSON.stringify(sessionData));
  } else {
    sessionStorage.removeItem("player_session");
  }
};

// Helper function to load from session storage
const loadFromSessionStorage = (): string | null => {
  if (typeof window === "undefined") return null;

  try {
    const savedData = sessionStorage.getItem("player_session");
    if (savedData) {
      const parsedData = JSON.parse(savedData) as { sessionId: string };
      return parsedData.sessionId;
    }
  } catch (error) {
    console.error("Error loading session from sessionStorage:", error);
    sessionStorage.removeItem("player_session");
  }
  return null;
};

export const useSessionStore = create<SessionState & SessionActions>()(
  (set) => ({
    // Initialize with session storage data
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
