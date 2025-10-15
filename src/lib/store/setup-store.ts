"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { TechStack } from "@/types";

export const DEFAULT_TECH_STACK: TechStack = {
  frontend: ["Next.js", "React", "TypeScript"],
  backend: ["Node.js", "Express.js"],
  database: ["PostgreSQL", "Prisma"],
  tools: ["Tailwind CSS", "shadcn/ui", "Vite", "ESLint", "Prettier"],
  uiComponents: ["shadcn/ui", "Radix UI", "Headless UI"],
};

interface SetupStore {
  techStack: TechStack;
  setTechStack: (techStack: TechStack) => void;
  resetTechStack: () => void;
}

export const useSetupStore = create<SetupStore>()(
  persist(
    (set) => ({
      techStack: DEFAULT_TECH_STACK,
      setTechStack: (techStack) => set({ techStack }),
      resetTechStack: () => set({ techStack: DEFAULT_TECH_STACK }),
    }),
    {
      name: "prompt-enhancer-tech-stack",
      version: 1,
      partialize: (state) => ({ techStack: state.techStack }),
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          try {
            const value = window.localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
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
    }
  )
);
