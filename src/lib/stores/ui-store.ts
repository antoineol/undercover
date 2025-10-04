import { create } from "zustand";

interface UIState {
  showWords: boolean;
  showConfig: boolean;
  showQR: boolean;
  shareButtonText: string;
  qrCodeDataUrl: string;
  isSharingWord: boolean;
  mrWhiteGuessInput: string;
  wordToShare: string;
}

interface UIActions {
  setShowWords: (show: boolean) => void;
  setShowConfig: (show: boolean) => void;
  setShowQR: (show: boolean) => void;
  setShareButtonText: (text: string) => void;
  setQrCodeDataUrl: (url: string) => void;
  setIsSharingWord: (sharing: boolean) => void;
  setMrWhiteGuessInput: (input: string) => void;
  setWordToShare: (word: string) => void;
  resetUI: () => void;
}

const initialState: UIState = {
  showWords: false,
  showConfig: false,
  showQR: false,
  shareButtonText: "📋 Partager le Lien",
  qrCodeDataUrl: "",
  isSharingWord: false,
  mrWhiteGuessInput: "",
  wordToShare: "",
};

export const useUIStore = create<UIState & UIActions>((set) => ({
  ...initialState,
  setShowWords: (show) => set({ showWords: show }),
  setShowConfig: (show) => set({ showConfig: show }),
  setShowQR: (show) => set({ showQR: show }),
  setShareButtonText: (text) => set({ shareButtonText: text }),
  setQrCodeDataUrl: (url) => set({ qrCodeDataUrl: url }),
  setIsSharingWord: (sharing) => set({ isSharingWord: sharing }),
  setMrWhiteGuessInput: (input) => set({ mrWhiteGuessInput: input }),
  setWordToShare: (word) => set({ wordToShare: word }),
  resetUI: () => set(initialState),
}));
