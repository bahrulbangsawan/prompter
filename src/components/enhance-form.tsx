"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { enhancePromptOptimized, getPerformanceStats } from "@/lib/api/optimized-zai-client";
import { enhanceSchema } from "@/lib/schemas/form-schemas";
import type { EnhanceSchema } from "@/lib/schemas/form-schemas";
import { useSetupStore } from "@/lib/store/setup-store";
import { useEnhanceFormStore } from "@/lib/store/enhance-form-store";
import { useResultStore } from "@/lib/store/result-store";
import type { EnhancedResult } from "@/types";
import { YamlResult } from "@/components/yaml-result";
import { TranslationNotice } from "@/components/translation-notice";
import { Progress } from "@/components/ui/enhanced-progress";
import { PerformanceIndicator } from "@/components/progressive-loading";

const WORD_LIMIT_OPTIONS = [100, 200, 300, 500];

function countWords(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getProgressLabel(stage: 'detecting' | 'translating' | 'enhancing' | 'completing'): string {
  switch (stage) {
    case 'detecting':
      return 'Detecting language...';
    case 'translating':
      return 'Translating to English...';
    case 'enhancing':
      return 'Enhancing prompt...';
    case 'completing':
      return 'Finalizing response...';
    default:
      return 'Processing...';
  }
}

export function EnhanceForm() {
  const { techStack } = useSetupStore();
  const { formData, setFormData, clearFormData } = useEnhanceFormStore();
  const {
    result,
    error,
    isLoading,
    loadingStage,
    loadingProgress,
    showOptimistic,
    performanceStats,
    setResult,
    setError,
    setLoadingState,
    setShowOptimistic,
    setPerformanceStats,
    clearResult,
    clearError
  } = useResultStore();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);
  const cacheRef = useRef<Map<string, EnhancedResult>>(new Map());

  const {
    control,
    register,
    handleSubmit,
    reset,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<EnhanceSchema>({
    resolver: zodResolver(enhanceSchema),
    defaultValues: {
      input: formData.input || "",
      selectorPath: formData.selectorPath || "",
      wordLimit: formData.wordLimit || 100,
    },
  });

  // Watch form values and persist to store with debouncing
  useEffect(() => {
    const subscription = watch((value) => {
      // Debounce updates to avoid excessive writes
      const timeoutId = setTimeout(() => {
        setFormData(value);
      }, 300);

      return () => clearTimeout(timeoutId);
    });

    return () => subscription.unsubscribe();
  }, [watch, setFormData]);

  const buildCacheKey = useCallback(
    (values: EnhanceSchema) => {
      const stackKey = JSON.stringify(techStack);
      return JSON.stringify({ ...values, techStack: stackKey });
    },
    [techStack]
  );

  const autoResize = useCallback((textarea: HTMLTextAreaElement | null) => {
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      autoResize(textareaRef.current);
    }
  }, [autoResize]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "enter") {
        event.preventDefault();
        submitRef.current?.click();
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setFocus("input");
        textareaRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setFocus]);

  const submitForm = useCallback(
    async (values: EnhanceSchema, skipCache = false) => {
      setLoadingState(true, 'enhancing', 0);
      clearError();
      setShowOptimistic(false);

      const cacheKey = buildCacheKey(values);

      // Check local cache first (backwards compatibility)
      if (!skipCache) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached) {
          setResult({ ...cached, timestamp: new Date() });
          setLoadingState(false);
          toast({
            title: "Loaded from cache",
            description: "We reused a recently generated prompt for identical inputs.",
          });
          return;
        }
      }

      // Simulate progress stages
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 10, 90);
        setLoadingState(true, 'enhancing', currentProgress);
      }, 200);

      try {
        // Show optimistic update for better UX
        if (values.input.length > 50) {
          setShowOptimistic(true);
          setTimeout(() => setShowOptimistic(false), 2000);
        }

        // Use optimized API client
        const response = await enhancePromptOptimized({
          userInput: values.input,
          wordLimit: values.wordLimit,
          selectorPath: values.selectorPath,
          techStack,
        });

        clearInterval(progressInterval);
        setLoadingState(true, 'completing', 100);

        const enhanced: EnhancedResult = {
          yaml: response.yaml,
          timestamp: new Date(),
          wordCount: countWords(response.yaml),
          translation: response.translation,
        };

        // Cache result locally (backwards compatibility)
        cacheRef.current.set(cacheKey, enhanced);
        setResult(enhanced);

        // Update performance stats
        setPerformanceStats(response.metrics);

        // Show appropriate success message
        if (response.fromCache) {
          toast({
            title: "Loaded from cache",
            description: "Response delivered instantly from intelligent cache.",
          });
        } else {
          const message = response.translation?.wasTranslated
            ? `Your ${response.translation.originalLanguageName} input was translated and enhanced successfully.`
            : "Prompt enhanced successfully!";
          toast({
            title: "Enhancement complete",
            description: message,
          });
        }

        // Show translation notification if translation occurred
        if (response.translation?.wasTranslated) {
          toast({
            title: "Translated to English",
            description: `Your ${response.translation.originalLanguageName} input was translated for optimal results.`,
          });
        }
      } catch (apiError) {
        clearInterval(progressInterval);
        const message =
          apiError instanceof Error
            ? apiError.message
            : "Something went wrong while enhancing your prompt.";
        setError(message);
        toast({
          title: "Enhancement failed",
          description: message,
          variant: "destructive",
        });
      } finally {
        clearInterval(progressInterval);
        setLoadingState(false);
        setShowOptimistic(false);
      }
    },
    [buildCacheKey, techStack, toast, setResult, setLoadingState, setError, setShowOptimistic, setPerformanceStats, clearError]
  );

  const onSubmit = useCallback(
    async (values: EnhanceSchema) => {
      await submitForm(values, false);
    },
    [submitForm]
  );

  const handleRegenerate = useCallback(() => {
    const values = {
      input: textareaRef.current?.value || "",
      wordLimit: control._formValues.wordLimit || 100,
      selectorPath: control._formValues.selectorPath || "",
    };
    submitForm(values as EnhanceSchema, true);
  }, [submitForm, control]);

  const handleReset = useCallback(() => {
    reset({ input: "", selectorPath: "", wordLimit: 100 });
    clearFormData();
    clearResult();
    clearError();
    textareaRef.current?.focus();
  }, [reset, clearFormData, clearResult, clearError, textareaRef]);

  const inputErrors = useMemo(() => ({
    input: errors.input?.message,
    selectorPath: errors.selectorPath?.message,
    wordLimit: errors.wordLimit?.message,
  }), [errors.input?.message, errors.selectorPath?.message, errors.wordLimit?.message]);

  const inputRegistration = register("input");
  const selectorRegistration = register("selectorPath");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhance your prompt</CardTitle>
          <CardDescription>
            Transform rough ideas into a structured YAML prompt optimized for AI
            assistants. Include as much context as possible for the best results.
            <br />
            <span className="text-sm text-muted-foreground">
              All inputs are automatically translated to English for optimal AI responses.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="input">Rough explanation</Label>
                <span className="text-xs text-muted-foreground">Cmd/Ctrl + K to focus</span>
              </div>
              <Textarea
                id="input"
                rows={3}
                placeholder="Describe what you need help building or improving..."
                {...inputRegistration}
                ref={(instance) => {
                  inputRegistration.ref(instance);
                  textareaRef.current = instance;
                  autoResize(instance);
                }}
                onInput={(event) => autoResize(event.currentTarget)}
                className="min-h-[120px] resize-none"
              />
              {inputErrors.input && (
                <p className="text-sm text-destructive">{inputErrors.input}</p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wordLimit">Word limit</Label>
                <Controller
                  control={control}
                  name="wordLimit"
                  render={({ field }) => (
                    <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                      <SelectTrigger id="wordLimit">
                        <SelectValue placeholder="Select word limit" />
                      </SelectTrigger>
                      <SelectContent>
                        {WORD_LIMIT_OPTIONS.map((option) => (
                          <SelectItem key={option} value={String(option)}>
                            {option} words
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {inputErrors.wordLimit && (
                  <p className="text-sm text-destructive">{inputErrors.wordLimit}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="selectorPath">Selector path (optional)</Label>
                <Textarea
                  id="selectorPath"
                  rows={2}
                  placeholder="e.g. main > section:nth-child(2) .card"
                  {...selectorRegistration}
                  ref={(instance) => {
                    selectorRegistration.ref(instance);
                    autoResize(instance);
                  }}
                  onInput={(event) => autoResize(event.currentTarget)}
                  className="min-h-[80px] resize-none"
                />
                {inputErrors.selectorPath && (
                  <p className="text-sm text-destructive">{inputErrors.selectorPath}</p>
                )}
              </div>
            </div>

            {error && (
              <Alert>
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Basic Progress Bar */}
            {isLoading && (
              <Progress
                value={loadingProgress}
                showLabel
                label={getProgressLabel(loadingStage)}
                variant="info"
                striped
                animated
                className="w-full"
              />
            )}

            {/* Optimistic Update */}
            {showOptimistic && !isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
                <div className="flex items-center justify-center h-5 w-5 rounded-full bg-blue-500">
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Preparing to enhance your prompt...</p>
                  <p className="text-sm text-blue-700">Analyzing your input for optimal results</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Cmd/Ctrl + Enter to submit
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
                <Button type="submit" ref={submitRef} disabled={isLoading}>
                  {isLoading ? "Enhancing..." : "Enhance prompt"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Show translation notice if translation occurred */}
      {result?.translation && (
        <TranslationNotice translation={result.translation} />
      )}

      <YamlResult
        result={result}
        isLoading={isLoading}
        error={error}
        onRegenerate={handleRegenerate}
      />

      {/* Performance Indicator */}
      {result && !isLoading && performanceStats && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <PerformanceIndicator metrics={performanceStats} />
          <span>
            {getPerformanceStats().cacheHitRate > 0 &&
              `Cache hit rate: ${(getPerformanceStats().cacheHitRate * 100).toFixed(0)}%`
            }
          </span>
        </div>
      )}
    </div>
  );
}
