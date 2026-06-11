import { create } from 'zustand';

interface AppState {
  portfolioId: string | null;
  setPortfolioId: (id: string | null) => void;
  activeCanvas: string;
  setActiveCanvas: (canvas: string) => void;
  canvasPayload: any;
  setCanvasPayload: (payload: any) => void;
}

export const useAppStore = create<AppState>((set) => ({
  portfolioId: null,
  setPortfolioId: (id) => set({ portfolioId: id }),
  activeCanvas: 'PortfolioSummary',
  setActiveCanvas: (canvas) => set({ activeCanvas: canvas }),
  canvasPayload: null,
  setCanvasPayload: (payload) => set({ canvasPayload: payload }),
}));
