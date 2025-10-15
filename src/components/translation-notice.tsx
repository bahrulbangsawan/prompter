/**
 * Translation Notice Component
 * Shows user feedback when input text is translated from another language to English
 */

import { Globe, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface TranslationNoticeProps {
  translation: {
    originalText: string;
    translatedText: string;
    originalLanguage: string;
    originalLanguageName: string;
    wasTranslated: boolean;
    confidence: number;
  } | null | undefined;
  className?: string;
}

export function TranslationNotice({ translation, className }: TranslationNoticeProps) {
  if (!translation || !translation.wasTranslated) {
    return null;
  }

  const { originalText, translatedText, originalLanguageName, confidence } = translation;

  // Determine confidence level styling
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return "text-green-600";
    if (confidence >= 0.5) return "text-yellow-600";
    return "text-orange-600";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return "High confidence";
    if (confidence >= 0.5) return "Medium confidence";
    return "Low confidence";
  };

  return (
    <Alert className={`border-blue-200 bg-blue-50 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Globe className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-blue-900">Translated to English</h4>
            <span className={`text-sm font-medium ${getConfidenceColor(confidence)}`}>
              ({getConfidenceLabel(confidence)})
            </span>
          </div>

          <AlertDescription className="space-y-3 text-blue-800">
            <div className="flex items-center gap-1 text-sm">
              <span className="font-medium">Detected language:</span>
              <span>{originalLanguageName}</span>
            </div>

            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">Original:</span>
                <div className="mt-1 p-2 bg-white rounded border border-blue-200 text-sm">
                  {originalText.length > 200 ? `${originalText.substring(0, 200)}...` : originalText}
                </div>
              </div>

              <div className="text-sm">
                <span className="font-medium">English translation:</span>
                <div className="mt-1 p-2 bg-white rounded border border-green-200 text-sm">
                  {translatedText.length > 200 ? `${translatedText.substring(0, 200)}...` : translatedText}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-blue-600">
              <CheckCircle className="h-3 w-3" />
              <span>Your prompt has been processed in English for optimal results</span>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}