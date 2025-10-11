import { create } from "zustand";

interface UIState {
  showWords: boolean;
  mrWhiteGuessInput: string;
}

interface UIActions {
  setShowWords: (show: boolean) => void;
  setMrWhiteGuessInput: (input: string) => void;
  resetUI: () => void;
}

const initialState: UIState = {
  showWords: false,
  mrWhiteGuessInput: "",
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...initialState,
  setShowWords: (show) => set({ showWords: show }),
  setMrWhiteGuessInput: (input) => set({ mrWhiteGuessInput: input }),
  resetUI: () => set(initialState),
}));
