"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EnhanceSchema } from "@/lib/schemas/form-schemas";

interface EnhanceFormStore {
  // Form data
  formData: Partial<EnhanceSchema>;

  // Actions
  setFormData: (data: Partial<EnhanceSchema>) => void;
  updateFormField: (field: keyof EnhanceSchema, value: EnhanceSchema[keyof EnhanceSchema]) => void;
  clearFormData: () => void;

  // State helpers
  hasData: boolean;
  getField: (field: keyof EnhanceSchema) => EnhanceSchema[keyof EnhanceSchema] | undefined;
}

const DEFAULT_FORM_DATA: Partial<EnhanceSchema> = {
  input: "",
  wordLimit: 100,
  selectorPath: "",
};

export const useEnhanceFormStore = create<EnhanceFormStore>()(
  persist(
    (set, get) => ({
      // Initial state
      formData: DEFAULT_FORM_DATA,
      hasData: false,

      // Set entire form data
      setFormData: (data) => {
        set((state) => {
          const newFormData = { ...state.formData, ...data };
          return {
            formData: newFormData,
            hasData: hasValidData(newFormData),
          };
        });
      },

      // Update single field
      updateFormField: (field, value) => {
        set((state) => {
          const newFormData = { ...state.formData, [field]: value };
          return {
            formData: newFormData,
            hasData: hasValidData(newFormData),
          };
        });
      },

      // Clear all form data
      clearFormData: () => {
        set({
          formData: DEFAULT_FORM_DATA,
          hasData: false,
        });
      },

      // Get specific field value
      getField: (field) => {
        return get().formData[field];
      },
    }),
    {
      name: "prompt-enhancer-form-data",
      version: 1,
      partialize: (state) => ({ formData: state.formData }),
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          try {
            const value = window.localStorage.getItem(key);
            if (!value) return null;

            const parsed = JSON.parse(value);
            // Handle migration from older versions
            if (parsed.state?.formData) {
              return parsed.state.formData;
            }
            return parsed.formData || parsed;
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

// Helper function to check if form has meaningful data
function hasValidData(formData: Partial<EnhanceSchema>): boolean {
  return !!(
    formData.input?.trim() ||
    formData.selectorPath?.trim() ||
    (formData.wordLimit && formData.wordLimit !== 100)
  );
}