export interface TechStack {
  frontend: string[];
  backend: string[];
  database: string[];
  tools: string[];
  uiComponents: string[];
}

export interface EnhanceFormData {
  input: string;
  wordLimit: number;
  selectorPath?: string;
}

export interface EnhancedResult {
  yaml: string;
  timestamp: Date;
  wordCount: number;
  translation?: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    originalLanguageName: string;
    wasTranslated: boolean;
    confidence: number;
  };
}

export interface SetupFormData {
  techStack: TechStack;
}
