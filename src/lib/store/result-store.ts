"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EnhancedResult } from "@/types";

interface ResultStore {
  // Enhanced result state
  result: EnhancedResult | undefined;
  error: string | undefined;

  // Loading states (not persisted - resets on page reload)
  isLoading: boolean;
  loadingStage: 'detecting' | 'translating' | 'enhancing' | 'completing';
  loadingProgress: number;
  showOptimistic: boolean;

  // Performance stats (not persisted - resets on page reload)
  performanceStats: unknown;

  // Actions
  setResult: (result: EnhancedResult) => void;
  setError: (error: string | undefined) => void;
  setLoadingState: (isLoading: boolean, stage?: 'detecting' | 'translating' | 'enhancing' | 'completing', progress?: number) => void;
  setShowOptimistic: (show: boolean) => void;
  setPerformanceStats: (stats: unknown) => void;

  // Clear functions
  clearResult: () => void;
  clearError: () => void;
  resetAll: () => void;

  // State helpers
  hasResult: boolean;
  hasError: boolean;
}

export const useResultStore = create<ResultStore>()(
  persist(
    (set) => ({
      // Initial persistent state
      result: undefined,
      error: undefined,

      // Initial non-persistent state (resets on page reload)
      isLoading: false,
      loadingStage: 'enhancing' as const,
      loadingProgress: 0,
      showOptimistic: false,
      performanceStats: null,

      // Set enhanced result
      setResult: (result) => {
        set({ result, error: undefined });
      },

      // Set error state
      setError: (error) => {
        set({ error, result: undefined });
      },

      // Set loading state
      setLoadingState: (isLoading, stage = 'enhancing', progress = 0) => {
        set({
          isLoading,
          loadingStage: stage,
          loadingProgress: progress
        });
      },

      // Set optimistic update state
      setShowOptimistic: (show) => {
        set({ showOptimistic: show });
      },

      // Set performance stats
      setPerformanceStats: (stats) => {
        set({ performanceStats: stats });
      },

      // Clear result only
      clearResult: () => {
        set({ result: undefined });
      },

      // Clear error only
      clearError: () => {
        set({ error: undefined });
      },

      // Reset all state (including non-persistent)
      resetAll: () => {
        set({
          result: undefined,
          error: undefined,
          isLoading: false,
          loadingStage: 'enhancing',
          loadingProgress: 0,
          showOptimistic: false,
          performanceStats: null,
        });
      },

      // Computed state helpers
      hasResult: false,
      hasError: false,
    }),
    {
      name: "prompt-enhancer-results",
      version: 1,
      // Only persist the result and error, not loading states
      partialize: (state) => ({
        result: state.result,
        error: state.error
      }),
      // Custom storage to handle serialization
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          try {
            const value = window.localStorage.getItem(key);
            if (!value) return null;

            const parsed = JSON.parse(value);
            if (parsed.state) {
              return {
                state: {
                  result: parsed.state.result,
                  error: parsed.state.error,
                }
              };
            }
            return parsed;
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return;
          try {
            window.localStorage.setItem(key, JSON.stringify(value));
          } catch {
            // Silent fail if localStorage is not available
          }
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return;
          try {
            window.localStorage.removeItem(key);
          } catch {
            // Silent fail if localStorage is not available
          }
        },
      },
      // Handle migration and computed properties
      onRehydrateStorage: () => (state) => {
        if (state) {
          Object.assign(state, {
            hasResult: !!state.result,
            hasError: !!state.error,
          });
        }
      },
    }
  )
);

// Computed properties getter
export const useResultComputed = () => {
  const result = useResultStore((state) => state.result);
  const error = useResultStore((state) => state.error);

  return {
    hasResult: !!result,
    hasError: !!error,
  };
};