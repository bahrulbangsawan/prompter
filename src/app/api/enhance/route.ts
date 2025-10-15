import { NextRequest, NextResponse } from "next/server";
import yaml from "js-yaml";

import type { TechStack } from "@/types";
import { translateToEnglishCached } from "@/lib/services/translation";

const API_URL = process.env.NEXT_PUBLIC_GROK_API_URL ?? "https://api.x.ai/v1";
const API_KEY = process.env.GROK_API_KEY ?? "";

interface EnhanceRequestBody {
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

interface GrokRequest {
  model: string;
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface GrokResponse {
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
  };
}

interface ParsedYaml {
  task?: {
    summary?: string;
    goals?: string[];
  };
  tech_stack?: Record<string, string[] | null | undefined>;
  constraints?: string[];
  selector_path?: string | null;
  [key: string]: unknown;
}

const PROMPT_TEMPLATE = `You are an expert technical writer creating structured prompts for AI code generation.
Return a YAML document with the following structure:

task:
  summary: <one sentence summary>
  goals:
    - <goal 1>
    - <goal 2>
tech_stack:
  frontend:
    - <frontend item>
  backend:
    - <backend item>
  database:
    - <database item>
  tools:
    - <tool>
constraints:
  - <constraint>
selector_path: <optional selector path>

Important instructions:
- Use concise, imperative language suitable for prompting an AI developer
- Do NOT include word limits or length constraints in the output
- Focus only on functional and technical constraints
- Use simple single-line strings in YAML (no block scalars like >- or |)
- Keep each line concise and under 100 characters when possible
- Return valid YAML without markdown code fences
- Use "null" or omit fields that are not applicable instead of "n/a"
`;

function buildUserMessage(params: EnhanceRequestBody) {
  const stackSummary = Object.entries(params.techStack)
    .map(([key, values]) => `${key}: ${values.join(", ") || "n/a"}`)
    .join(" | ");

  const selectorInfo = params.selectorPath
    ? `Target selector path: ${params.selectorPath}.`
    : "No specific selector was provided.";

  return `Original explanation: ${params.userInput}\nDesired word limit: ${params.wordLimit}.\n${selectorInfo}\nCurrent project tech stack -> ${stackSummary}`;
}

async function requestWithRetry(request: GrokRequest, attempts = 3, delay = 750) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetch(`${API_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`Grok API error (status ${response.status}):`, text);

        if (response.status === 429 && attempt < attempts) {
          console.log(`Rate limited, retrying in ${delay * attempt}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
          continue;
        }

        throw new Error(`API error ${response.status}: ${text}`);
      }

      const payload = (await response.json()) as GrokResponse;
      if (payload.error) {
        throw new Error(payload.error.message ?? "Unknown API error");
      }
      return payload;
    } catch (error) {
      if (attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }
  throw new Error("Unable to complete request to Grok API");
}

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error("Missing Grok API key");
      return NextResponse.json(
        { error: "Missing Grok API key. Please set GROK_API_KEY in your environment." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as EnhanceRequestBody;
    console.log("Received request:", { wordLimit: body.wordLimit, hasInput: !!body.userInput });

    // Detect language and translate to English if needed
    let finalUserInput = body.userInput;
    let translationResult = null;

    try {
      translationResult = await translateToEnglishCached(body.userInput);
      finalUserInput = translationResult.translatedText;

      if (translationResult.wasTranslated) {
        console.log(`Translated from ${translationResult.originalLanguageName} to English:`, {
          original: translationResult.originalText.substring(0, 100) + "...",
          translated: translationResult.translatedText.substring(0, 100) + "...",
          confidence: translationResult.confidence
        });
      }
    } catch (translationError) {
      console.warn("Translation failed, using original text:", translationError);
      // Continue with original text if translation fails
    }

    const processedBody = {
      ...body,
      userInput: finalUserInput
    };

    const grokRequest: GrokRequest = {
      model: "grok-code-fast-1",
      temperature: 0,
      max_tokens: Math.max(500, Math.round(body.wordLimit * 3)), // Ensure minimum 500 tokens, allow 3x word limit for YAML structure
      stream: false,
      messages: [
        {
          role: "system",
          content: PROMPT_TEMPLATE,
        },
        {
          role: "user",
          content: buildUserMessage(processedBody),
        },
      ],
    };

    console.log("Calling Grok API...");
    console.log("- URL:", `${API_URL}/chat/completions`);
    console.log("- Model:", grokRequest.model);
    console.log("- Has API Key:", !!API_KEY);

    const response = await requestWithRetry(grokRequest);
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      console.error("Empty response from Grok API:", response);
      return NextResponse.json(
        { error: "The API returned an empty response." },
        { status: 500 }
      );
    }

    console.log("Received response from Grok, parsing YAML...");

    try {
      // Remove markdown code fences if present
      let cleanedContent = content.trim();

      // Remove ```yaml or ``` at the start
      cleanedContent = cleanedContent.replace(/^```(?:yaml)?\s*\n?/i, '');

      // Remove ``` at the end
      cleanedContent = cleanedContent.replace(/\n?```\s*$/i, '');

      // Trim again after removing fences
      cleanedContent = cleanedContent.trim();

      const parsed = yaml.load(cleanedContent) as ParsedYaml;

      // Remove null/empty values from tech_stack
      if (parsed?.tech_stack) {
        Object.keys(parsed.tech_stack).forEach(key => {
          const value = parsed.tech_stack?.[key];
          // Remove if null, empty array, or array containing only null/empty values
          if (
            value === null ||
            value === undefined ||
            (Array.isArray(value) && (
              value.length === 0 ||
              value.every(item => item === null || item === undefined || item === '' || item === 'null')
            ))
          ) {
            delete parsed.tech_stack?.[key];
          }
        });
      }

      // Remove selector_path if null or empty
      if (
        parsed?.selector_path === null ||
        parsed?.selector_path === undefined ||
        parsed?.selector_path === '' ||
        parsed?.selector_path === 'null'
      ) {
        delete parsed.selector_path;
      }

      const formattedYaml = yaml.dump(parsed, {
        lineWidth: 80,
        skipInvalid: true,
        noRefs: true
      });

      const response: ApiResponse = { yaml: formattedYaml };

      // Include translation information if translation occurred
      if (translationResult && translationResult.wasTranslated) {
        response.translation = {
          originalText: translationResult.originalText,
          translatedText: translationResult.translatedText,
          originalLanguage: translationResult.originalLanguage,
          originalLanguageName: translationResult.originalLanguageName,
          wasTranslated: translationResult.wasTranslated,
          confidence: translationResult.confidence
        };
      }

      return NextResponse.json(response);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      console.error("YAML parsing error:", errorMessage);
      return NextResponse.json(
        { error: `Failed to parse YAML from API response. Error: ${errorMessage}. Raw response: ${content}` },
        { status: 500 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("API route error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
