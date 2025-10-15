import type { TechStack } from "@/types";

export interface EnhancePromptParams {
  userInput: string;
  wordLimit: number;
  selectorPath?: string;
  techStack: TechStack;
}

interface ApiResponse {
  yaml?: string;
  error?: string;
  translation?: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    originalLanguageName: string;
    wasTranslated: boolean;
    confidence: number;
  };
}

export async function enhancePrompt(
  params: EnhancePromptParams
): Promise<{ yaml: string; translation?: ApiResponse["translation"] }> {
  const response = await fetch("/api/enhance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiResponse;
    throw new Error(errorData.error ?? `API request failed with status ${response.status}`);
  }

  const data = (await response.json()) as ApiResponse;

  if (data.error) {
    throw new Error(data.error);
  }

  if (!data.yaml) {
    throw new Error("The API returned an empty response.");
  }

  return {
    yaml: data.yaml,
    translation: data.translation
  };
}
