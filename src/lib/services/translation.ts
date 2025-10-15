/**
 * Translation Service
 * Translates non-English text to English for consistent AI outputs
 */

import { detectLanguage, getLanguageName } from './language-detection';

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  originalLanguageName: string;
  wasTranslated: boolean;
  confidence: number;
}

/**
 * Translates text to English using multiple translation strategies
 * @param text The text to translate
 * @param preferredSourceLanguage Optional source language hint
 * @returns Translation result with metadata
 */
export async function translateToEnglish(
  text: string,
  _preferredSourceLanguage?: string
): Promise<TranslationResult> {
  if (!text || text.trim().length === 0) {
    return {
      originalText: text,
      translatedText: text,
      originalLanguage: 'unknown',
      originalLanguageName: 'Unknown',
      wasTranslated: false,
      confidence: 0
    };
  }

  // First, detect the language
  const detection = detectLanguage(text);

  // If already English or confidence is too low, return as-is
  if (detection.isEnglish || !detection.needsTranslation) {
    return {
      originalText: text,
      translatedText: text,
      originalLanguage: detection.language,
      originalLanguageName: getLanguageName(detection.language),
      wasTranslated: false,
      confidence: detection.confidence
    };
  }

  // Attempt translation using available services
  const translatedText = await attemptTranslation(text, detection.language, preferredSourceLanguage);

  return {
    originalText: text,
    translatedText,
    originalLanguage: detection.language,
    originalLanguageName: getLanguageName(detection.language),
    wasTranslated: translatedText !== text,
    confidence: detection.confidence
  };
}

/**
 * Attempts translation using multiple strategies in order of preference
 */
async function attemptTranslation(
  text: string,
  detectedLanguage: string,
  _preferredSourceLanguage?: string
): Promise<string> {
  // Strategy 1: Try Grok API for translation (if available)
  const grokTranslation = await translateWithGrok(text, detectedLanguage);
  if (grokTranslation && grokTranslation !== text) {
    return grokTranslation;
  }

  // Strategy 2: Try Google Translate API (if configured)
  const googleTranslation = await translateWithGoogle(text, detectedLanguage);
  if (googleTranslation && googleTranslation !== text) {
    return googleTranslation;
  }

  // Strategy 3: Try simple rule-based translation for common patterns
  const ruleBasedTranslation = translateWithRules(text, detectedLanguage);
  if (ruleBasedTranslation && ruleBasedTranslation !== text) {
    return ruleBasedTranslation;
  }

  // Fallback: Return original text with English instruction
  return `${text} (Please translate to English)`;
}

/**
 * Attempts translation using Grok API
 */
async function translateWithGrok(text: string, sourceLanguage: string): Promise<string | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_GROK_API_URL ?? "https://api.x.ai/v1";
    const API_KEY = process.env.GROK_API_KEY ?? "";

    if (!API_KEY) {
      console.warn("Grok API key not configured for translation");
      return null;
    }

    const sourceLanguageName = getLanguageName(sourceLanguage);
    const prompt = `Translate the following text from ${sourceLanguageName} to English. Return only the translated text without any explanations or formatting:\n\n${text}`;

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-code-fast-1",
        temperature: 0.1,
        max_tokens: Math.max(100, text.length * 2),
        messages: [
          {
            role: "system",
            content: "You are a professional translator. Translate the given text accurately to English, preserving the original meaning and technical terms where appropriate."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      console.warn(`Grok translation API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    return translatedText || null;
  } catch (error) {
    console.warn("Grok translation failed:", error);
    return null;
  }
}

/**
 * Attempts translation using Google Translate API (placeholder for future implementation)
 */
async function translateWithGoogle(text: string, sourceLanguage: string): Promise<string | null> {
  // This is a placeholder for Google Translate API integration
  // You would need to set up Google Cloud Translation API credentials

  try {
    // Implementation would go here
    // const { Translate } = require('@google-cloud/translate').v2;
    // const translate = new Translate();
    // const [translation] = await translate.translate(text, { from: sourceLanguage, to: 'en' });
    // return translation;

    console.log("Google Translate API not configured");
    return null;
  } catch (error) {
    console.warn("Google Translate failed:", error);
    return null;
  }
}

/**
 * Simple rule-based translation for common technical terms and patterns
 */
function translateWithRules(text: string, sourceLanguage: string): string | null {
  const commonTranslations: Record<string, Record<string, string>> = {
    es: {
      'crear': 'create',
      'mostrar': 'show',
      'ocultar': 'hide',
      'actualizar': 'update',
      'eliminar': 'delete',
      'añadir': 'add',
      'buscar': 'search',
      'guardar': 'save',
      'cancelar': 'cancel',
      'continuar': 'continue',
      'página': 'page',
      'formulario': 'form',
      'botón': 'button',
      'enlace': 'link',
      'lista': 'list',
      'tabla': 'table',
      'menú': 'menu',
      'usuario': 'user',
      'contraseña': 'password',
      'correo': 'email',
      'teléfono': 'phone',
      'dirección': 'address',
      'nombre': 'name',
      'descripción': 'description',
      'título': 'title',
      'contenido': 'content'
    },
    fr: {
      'créer': 'create',
      'afficher': 'show',
      'cacher': 'hide',
      'mettre à jour': 'update',
      'supprimer': 'delete',
      'ajouter': 'add',
      'rechercher': 'search',
      'enregistrer': 'save',
      'annuler': 'cancel',
      'continuer': 'continue',
      'page': 'page',
      'formulaire': 'form',
      'bouton': 'button',
      'lien': 'link',
      'liste': 'list',
      'tableau': 'table',
      'menu': 'menu',
      'utilisateur': 'user',
      'mot de passe': 'password',
      'email': 'email',
      'téléphone': 'phone',
      'adresse': 'address',
      'nom': 'name',
      'description': 'description',
      'titre': 'title',
      'contenu': 'content'
    },
    de: {
      'erstellen': 'create',
      'anzeigen': 'show',
      'ausblenden': 'hide',
      'aktualisieren': 'update',
      'löschen': 'delete',
      'hinzufügen': 'add',
      'suchen': 'search',
      'speichern': 'save',
      'abbrechen': 'cancel',
      'fortfahren': 'continue',
      'seite': 'page',
      'formular': 'form',
      'schaltfläche': 'button',
      'link': 'link',
      'liste': 'list',
      'tabelle': 'table',
      'menü': 'menu',
      'benutzer': 'user',
      'passwort': 'password',
      'email': 'email',
      'telefon': 'phone',
      'adresse': 'address',
      'name': 'name',
      'beschreibung': 'description',
      'titel': 'title',
      'inhalt': 'content'
    }
  };

  const translations = commonTranslations[sourceLanguage];
  if (!translations) {
    return null;
  }

  let translatedText = text.toLowerCase();

  // Apply common word translations
  for (const [foreign, english] of Object.entries(translations)) {
    const regex = new RegExp(foreign, 'gi');
    translatedText = translatedText.replace(regex, english);
  }

  // Return translated text if any changes were made
  if (translatedText !== text.toLowerCase()) {
    return translatedText;
  }

  return null;
}

/**
 * Caches translation results to avoid re-translation
 */
const translationCache = new Map<string, TranslationResult>();

/**
 * Cached version of translateToEnglish
 */
export async function translateToEnglishCached(
  text: string,
  preferredSourceLanguage?: string
): Promise<TranslationResult> {
  const cacheKey = `${text}-${preferredSourceLanguage || ''}`;

  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  const result = await translateToEnglish(text, preferredSourceLanguage);
  translationCache.set(cacheKey, result);

  // Limit cache size
  if (translationCache.size > 1000) {
    const firstKey = translationCache.keys().next().value;
    translationCache.delete(firstKey);
  }

  return result;
}

/**
 * Clears the translation cache
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}