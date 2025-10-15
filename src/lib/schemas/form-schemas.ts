import { z } from "zod";

export const enhanceSchema = z.object({
  input: z
    .string()
    .min(10, "Please provide at least 10 characters to enhance.")
    .max(4000, "Input is too long. Please shorten your description."),
  wordLimit: z.union([
    z.literal(100),
    z.literal(200),
    z.literal(300),
    z.literal(500),
  ]),
  selectorPath: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value || value.trim() === "") return true;

        // Try to validate by checking if document.querySelector would accept it
        // Allow common CSS selector patterns without overly restrictive validation
        try {
          // Basic validation: should not be just whitespace and should have valid characters
          const trimmed = value.trim();
          if (trimmed.length === 0) return true;

          // Reject obviously invalid patterns
          if (/^[>+~]/.test(trimmed)) return false; // Can't start with combinators
          if (/[>+~]$/.test(trimmed)) return false; // Can't end with combinators

          // If in browser environment, use actual querySelector validation
          if (typeof document !== "undefined") {
            document.querySelector(trimmed);
          }

          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Please provide a valid CSS selector.",
      }
    ),
});

export const techStackSchema = z.object({
  frontend: z.array(z.string().min(1, "Technology name cannot be empty")).min(1, "Select at least one frontend tool."),
  backend: z.array(z.string().min(1, "Technology name cannot be empty")).default([]),
  database: z.array(z.string().min(1, "Technology name cannot be empty")).default([]),
  tools: z.array(z.string().min(1, "Technology name cannot be empty")).default([]),
  uiComponents: z.array(z.string().min(1, "Technology name cannot be empty")).default([]),
});

export const setupSchema = z.object({
  techStack: techStackSchema,
});

export type EnhanceSchema = z.infer<typeof enhanceSchema>;
export type SetupSchema = z.infer<typeof setupSchema>;
