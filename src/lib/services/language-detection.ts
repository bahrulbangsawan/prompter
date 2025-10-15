/**
 * Language Detection Service
 * Detects the language of input text to determine if translation is needed
 */

// Simple language detection patterns
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  // English patterns (should have highest confidence if detected)
  en: [
    // Common English words and patterns
    /\b(the|and|or|but|in|on|at|to|for|of|with|by|from|up|about|into|through|during|before|after|above|below|between|among|under|over|above)\b/gi,
    // Common English question words
    /\b(what|where|when|why|how|who|which|whose|do|does|did|can|could|will|would|should|may|might|must|shall|ought|need|dare)\b/gi,
    // Common English prepositions and articles
    /\b(a|an|the|is|are|was|were|be|been|being|have|has|had|do|does|did)\b/gi,
    // English specific characters
    /^[a-zA-Z0-9\s.,!?;:'"-]+$/
  ],

  // Spanish patterns
  es: [
    /\b(el|la|los|las|un|una|unos|unas|y|o|pero|si|no|en|de|del|por|para|con|sin|sobre|entre|hasta|hacia)\b/gi,
    /[ñáéíóúü]/i,
    /\b(qué|dónde|cuándo|por qué|cómo|quién|cuál|cuánto)\b/gi,
    // Spanish question endings
    /\?$/,
    // Spanish accented characters
    /[áéíóúüñÁÉÍÓÚÜÑ]/
  ],

  // French patterns
  fr: [
    /\b(le|la|les|un|une|des|et|ou|mais|si|ne|pas|dans|de|du|par|pour|avec|sans|sur|entre|jusque|vers)\b/gi,
    /[àâäéèêëïîôöùûüÿç]/i,
    /\b(quoi|où|quand|pourquoi|comment|qui|lequel|combien)\b/gi,
    // French question patterns
    /\b(est-ce-que|qu'est-ce que)\b/gi
  ],

  // German patterns
  de: [
    /\b(der|die|das|den|dem|des|ein|eine|einen|einem|eines|und|oder|aber|wenn|nicht|in|an|zu|für|mit|ohne|auf|unter|über)\b/gi,
    /[äöüßÄÖÜ]/i,
    /\b(was|wo|wann|warum|wie|wer|welcher|wieviel)\b/gi
  ],

  // Italian patterns
  it: [
    /\b(il|lo|la|le|gli|un|uno|una|e|o|ma|se|non|in|a|da|di|del|per|con|senza|su|tra|fra)\b/gi,
    /[àèéìíîòóù]/i,
    /\b(che|cosa|dove|quando|perché|come|chi|quale|quanto)\b/gi
  ],

  // Portuguese patterns
  pt: [
    /\b(o|a|os|as|um|uma|uns|umas|e|ou|mas|se|não|em|de|do|por|para|com|sem|sobre|entre|até|para)\b/gi,
    /[ãâáàéêíóôõúç]/i,
    /\b(o|que|onde|quando|por que|como|quem|qual|quanto)\b/gi
  ],

  // Russian patterns (Cyrillic)
  ru: [
    /[а-яё]/i,
    /\b(и|или|но|если|не|в|на|с|по|к|от|из|под|над|за|для|без|через|сквозь|около)\b/gi,
    /\b(что|где|когда|почему|как|кто|который|сколько)\b/gi
  ],

  // Chinese patterns
  zh: [
    /[\u4e00-\u9fff]/,
    /\b(什么|哪里|什么时候|为什么|如何|谁|哪个|多少)\b/g,
    /[\u3000-\u303f\uff00-\uffef]/  // Chinese punctuation
  ],

  // Japanese patterns
  ja: [
    /[\u3040-\u309f]/,  // Hiragana
    /[\u30a0-\u30ff]/,  // Katakana
    /[\u4e00-\u9fff]/,  // Kanji
    /\b(何|どこ|いつ|なぜ|どのように|誰|どれ|いくら)\b/g
  ],

  // Korean patterns
  ko: [
    /[\uac00-\ud7af]/,  // Hangul
    /\b(무엇|어디서|언제|왜|어떻게|누가|어떤|얼마나)\b/g
  ],

  // Arabic patterns
  ar: [
    /[\u0600-\u06ff]/,
    /\b(ماذا|أين|متى|لماذا|كيف|من|أي|كم)\b/g
  ],

  // Hindi patterns
  hi: [
    /[\u0900-\u097f]/,
    /\b(क्या|कहां|कब|क्यों|कैसे|कौन|कौन सा|कितना)\b/g
  ]
};

// Confidence threshold for language detection
const CONFIDENCE_THRESHOLD = 0.3;

export interface LanguageDetectionResult {
  language: string;
  confidence: number;
  isEnglish: boolean;
  needsTranslation: boolean;
}

/**
 * Detects the language of the given text
 * @param text The text to analyze
 * @returns Language detection result
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      language: 'unknown',
      confidence: 0,
      isEnglish: false,
      needsTranslation: false
    };
  }

  const cleanText = text.trim();
  const textLength = cleanText.length;

  // Score each language based on pattern matches
  const scores: Record<string, number> = {};

  for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;

    for (const pattern of patterns) {
      const matches = cleanText.match(pattern);
      if (matches) {
        // Weight matches by pattern type and frequency
        if (lang === 'en' && pattern.source.includes('\\\\b(the|and|or|but)')) {
          // High confidence for English common words
          score += matches.length * 2;
        } else if (pattern.source.includes('[\\\\u4e00-\\\\u9fff]') ||
                   pattern.source.includes('[\\\\u0600-\\\\u06ff]') ||
                   pattern.source.includes('[\\\\u0900-\\\\u097f]')) {
          // High confidence for non-Latin scripts
          score += matches.length * 3;
        } else {
          score += matches.length;
        }
      }
    }

    // Normalize score by text length
    scores[lang] = score / textLength;
  }

  // Find the language with highest score
  let detectedLanguage = 'unknown';
  let highestScore = 0;

  for (const [lang, score] of Object.entries(scores)) {
    if (score > highestScore) {
      highestScore = score;
      detectedLanguage = lang;
    }
  }

  const isEnglish = detectedLanguage === 'en';
  const needsTranslation = !isEnglish && highestScore > CONFIDENCE_THRESHOLD;

  return {
    language: detectedLanguage,
    confidence: highestScore,
    isEnglish,
    needsTranslation
  };
}

/**
 * Quick check if text appears to be in English
 * @param text The text to check
 * @returns True if text appears to be English
 */
export function isProbablyEnglish(text: string): boolean {
  const detection = detectLanguage(text);
  return detection.isEnglish || detection.confidence < CONFIDENCE_THRESHOLD;
}

/**
 * Get language name from language code
 * @param code Language code (e.g., 'en', 'es', 'fr')
 * @returns Human-readable language name
 */
export function getLanguageName(code: string): string {
  const languageNames: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'unknown': 'Unknown'
  };

  return languageNames[code] || 'Unknown';
}