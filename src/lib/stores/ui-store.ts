import { create } from "zustand";

interface UIState {
  showWords: boolean;
  showQR: boolean;
  shareButtonText: string;
  qrCodeDataUrl: string;
  mrWhiteGuessInput: string;
}

interface UIActions {
  setShowWords: (show: boolean) => void;
  setShowQR: (show: boolean) => void;
  setShareButtonText: (text: string) => void;
  setQrCodeDataUrl: (url: string) => void;
  setMrWhiteGuessInput: (input: string) => void;
  resetUI: () => void;
}

const initialState: UIState = {
  showWords: false,
  showQR: false,
  shareButtonText: "📋 Partager le Lien",
  qrCodeDataUrl: "",
  mrWhiteGuessInput: "",
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...initialState,
  setShowWords: (show) => set({ showWords: show }),
  setShowQR: (show) => set({ showQR: show }),
  setShareButtonText: (text) => set({ shareButtonText: text }),
  setQrCodeDataUrl: (url) => set({ qrCodeDataUrl: url }),
  setMrWhiteGuessInput: (input) => set({ mrWhiteGuessInput: input }),
  resetUI: () => set(initialState),
}));
