import { create } from "zustand";

interface UIState {
  showWords: boolean;
  showQR: boolean;
  qrCodeDataUrl: string;
  mrWhiteGuessInput: string;
}

interface UIActions {
  setShowWords: (show: boolean) => void;
  setShowQR: (show: boolean) => void;
  setQrCodeDataUrl: (url: string) => void;
  setMrWhiteGuessInput: (input: string) => void;
  resetUI: () => void;
}

const initialState: UIState = {
  showWords: false,
  showQR: false,
  qrCodeDataUrl: "",
  mrWhiteGuessInput: "",
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...initialState,
  setShowWords: (show) => set({ showWords: show }),
  setShowQR: (show) => set({ showQR: show }),
  setQrCodeDataUrl: (url) => set({ qrCodeDataUrl: url }),
  setMrWhiteGuessInput: (input) => set({ mrWhiteGuessInput: input }),
  resetUI: () => set(initialState),
}));
