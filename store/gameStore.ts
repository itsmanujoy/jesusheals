import { create } from "zustand";
import { Verse } from "@/data/verses";

export interface PlayerData {
  name: string;
  region: string;
}

export type LevelType = "intro" | "mcq" | "image" | "easy" | "medium2" | "medium" | "image2";

export interface LevelScore {
  level: LevelType;
  score: number;
  timeRemaining: number;
  correct: boolean;
}

export interface GameState {
  // Player data
  playerData: PlayerData | null;
  securityCode: string | null;

  // Game state
  currentLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null;
  currentVerse: Verse | null;
  levelScores: LevelScore[];
  gameStarted: boolean;
  gameCompleted: boolean;

  // Level control by host
  levelsUnlocked: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, boolean>;

  // Leaderboard rank tracking
  currentRank: number | null;
  previousRank: number | null;

  // Actions
  setPlayerData: (data: PlayerData) => void;
  generateSecurityCode: () => string;
  setSecurityCode: (code: string) => void;
  setCurrentLevel: (level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | null) => void;
  setCurrentVerse: (verse: Verse | null) => void;
  addLevelScore: (score: LevelScore) => void;
  setGameStarted: (started: boolean) => void;
  setGameCompleted: (completed: boolean) => void;
  setRank: (rank: number) => void;
  updateRankProgression: () => void;
  unlockLevel: (level: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  lockLevel: (level: 1 | 2 | 3 | 4 | 5 | 6 | 7) => void;
  isLevelAccessible: (level: 1 | 2 | 3 | 4 | 5 | 6 | 7) => boolean;
  setLevelsUnlocked: (levels: Record<1 | 2 | 3 | 4 | 5 | 6 | 7, boolean>) => void;
  resetGame: () => void;
  getFinalScore: () => number;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerData: null,
  securityCode: null,
  currentLevel: null,
  currentVerse: null,
  levelScores: [],
  gameStarted: false,
  gameCompleted: false,
  levelsUnlocked: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false },
  currentRank: null,
  previousRank: null,

  setPlayerData: (data) => set({ playerData: data }),

  generateSecurityCode: () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    set({ securityCode: code });
    return code;
  },

  setSecurityCode: (code) => set({ securityCode: code }),

  setCurrentLevel: (level) => set({ currentLevel: level }),

  setCurrentVerse: (verse) => set({ currentVerse: verse }),

  addLevelScore: (score) =>
    set((state) => ({
      levelScores: [...state.levelScores, score],
    })),

  setGameStarted: (started) => set({ gameStarted: started }),

  setGameCompleted: (completed) => set({ gameCompleted: completed }),

  setRank: (rank) =>
    set((state) => ({
      previousRank: state.currentRank,
      currentRank: rank,
    })),

  updateRankProgression: () => {
    // This will be called after each level to trigger rank animation
    set((state) => ({
      previousRank: state.currentRank,
    }));
  },

  unlockLevel: (level) =>
    set((state) => ({
      levelsUnlocked: { ...state.levelsUnlocked, [level]: true },
    })),

  lockLevel: (level) =>
    set((state) => ({
      levelsUnlocked: { ...state.levelsUnlocked, [level]: false },
    })),

  setLevelsUnlocked: (levels) => set({ levelsUnlocked: levels }),

  isLevelAccessible: (level) => {
    const state = get();
    return state.levelsUnlocked[level];
  },

  resetGame: () =>
    set({
      playerData: null,
      securityCode: null,
      currentLevel: null,
      currentVerse: null,
      levelScores: [],
      gameStarted: false,
      gameCompleted: false,
      levelsUnlocked: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false },
      currentRank: null,
      previousRank: null,
    }),

  getFinalScore: () => {
    const { levelScores } = get();
    return levelScores.reduce((sum, ls) => sum + ls.score, 0);
  },
}));

