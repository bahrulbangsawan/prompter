"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EnhanceFormData {
  input: string;
  selectorPath: string;
  wordLimit: number;
}

interface EnhanceStore {
  formData: EnhanceFormData;
  setFormData: (data: Partial<EnhanceFormData>) => void;
  resetFormData: () => void;
}

const DEFAULT_FORM_DATA: EnhanceFormData = {
  input: "",
  selectorPath: "",
  wordLimit: 100,
};

export const useEnhanceStore = create<EnhanceStore>()(
  persist(
    (set) => ({
      formData: DEFAULT_FORM_DATA,
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),
      resetFormData: () => set({ formData: DEFAULT_FORM_DATA }),
    }),
    {
      name: "prompt-enhancer-form-data",
      version: 1,
      partialize: (state) => ({ formData: state.formData }),
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          try {
            const value = window.sessionStorage.getItem(key);
            return value ? JSON.parse(value) : null;
          } catch {
            return null;
          }
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return;
          try {
            window.sessionStorage.setItem(key, JSON.stringify(value));
          } catch {
            // Silent fail if sessionStorage is not available
          }
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return;
          try {
            window.sessionStorage.removeItem(key);
          } catch {
            // Silent fail if sessionStorage is not available
          }
        },
      },
    }
  )
);
