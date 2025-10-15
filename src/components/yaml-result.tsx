"use client";

import { useEffect, useState } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Copy, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import type { EnhancedResult } from "@/types";
import { formatDate } from "@/lib/utils";

interface YamlResultProps {
  result?: EnhancedResult;
  isLoading?: boolean;
  error?: string;
  onRegenerate?: () => void;
}

export function YamlResult({ result, isLoading, error, onRegenerate }: YamlResultProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      setCopied(false);
    }
  }, [isLoading, result?.yaml]);

  const handleCopy = async () => {
    if (!result?.yaml) return;
    try {
      await navigator.clipboard.writeText(result.yaml);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "The enhanced prompt has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "We could not copy the prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-xl">Enhanced YAML Prompt</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Copy and paste this structured prompt directly into your preferred AI
            tool.
          </p>
        </div>
        <div className="flex gap-2">
          {onRegenerate && (
            <Button
              variant="outline"
              size="icon"
              onClick={onRegenerate}
              disabled={!result?.yaml || isLoading}
              title="Regenerate prompt"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            disabled={!result?.yaml || isLoading}
            title={copied ? "Copied!" : "Copy to clipboard"}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : result?.yaml ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">
                {result.wordCount} words
              </Badge>
              <span>Generated {formatDate(result.timestamp)}</span>
            </div>
            <div className="overflow-hidden rounded-lg border bg-muted/30">
              <Highlight
                code={result.yaml}
                language="yaml"
                theme={themes.nightOwl}
              >
                {({ className, style, tokens, getLineProps, getTokenProps }) => (
                  <pre className={`${className} max-h-[480px] overflow-auto p-4 text-sm`} style={style}>
                    {tokens && Array.isArray(tokens) ? tokens.map((line, i) => (
                      <div key={i} {...getLineProps({ line, key: i })}>
                        {line && Array.isArray(line) ? line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token, key })} />
                        )) : null}
                      </div>
                    )) : null}
                  </pre>
                )}
              </Highlight>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enhanced prompts will appear here after you submit the form.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
