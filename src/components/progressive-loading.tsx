/**
 * Progressive Loading Component
 * Provides smooth loading states and optimistic updates
 */

import { Loader2, Sparkles, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/enhanced-progress";
import { cn } from "@/lib/utils";
import type { PerformanceMetrics } from "@/lib/api/optimized-zai-client";

export interface ProgressiveLoadingProps {
  isLoading: boolean;
  stage?: 'detecting' | 'translating' | 'enhancing' | 'completing';
  progress?: number;
  message?: string;
  error?: string;
  className?: string;
  showOptimistic?: boolean;
  optimisticText?: string;
}

const loadingStages = {
  detecting: { icon: Sparkles, message: "Detecting language...", color: "text-blue-500" },
  translating: { icon: Zap, message: "Translating to English...", color: "text-green-500" },
  enhancing: { icon: Loader2, message: "Enhancing prompt...", color: "text-purple-500" },
  completing: { icon: CheckCircle, message: "Finalizing response...", color: "text-emerald-500" }
};

export function ProgressiveLoading({
  isLoading,
  stage = 'enhancing',
  progress = 0,
  message,
  error,
  className,
  showOptimistic = false,
  optimisticText
}: ProgressiveLoadingProps) {
  if (!isLoading && !error && !showOptimistic) {
    return null;
  }

  const stageConfig = loadingStages[stage];
  const Icon = stageConfig.icon;

  if (error) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <div className="flex-1">
            <p className="font-medium text-red-900">Request failed</p>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (showOptimistic && optimisticText && !isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          <div className="flex-1">
            <p className="font-medium text-blue-900">Optimistic Update</p>
            <p className="text-sm text-blue-700">{optimisticText}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3 p-4 rounded-lg border border-muted bg-muted/30">
        <Icon className={cn("h-5 w-5 animate-spin", stageConfig.color)} />
        <div className="flex-1">
          <p className={cn("font-medium", stageConfig.color)}>
            {message || stageConfig.message}
          </p>
          {progress > 0 && (
            <Progress
              value={progress}
              size="sm"
              variant="info"
              striped
              animated
              showLabel
              label="Progress"
            />
          )}
        </div>
      </div>

      {/* Performance tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>💡 Using intelligent caching to speed up your request</p>
        <p>🚀 Automatic retries for reliable responses</p>
      </div>
    </div>
  );
}

/**
 * Skeleton loading for immediate feedback
 */
export function SkeletonLoader() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted rounded w-2/3"></div>
    </div>
  );
}

/**
 * Performance indicator component
 */
export function PerformanceIndicator({ metrics }: { metrics: PerformanceMetrics }) {
  if (!metrics) return null;

  const { duration, fromCache, cacheHit } = metrics;

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {fromCache || cacheHit ? (
        <>
          <CheckCircle className="h-3 w-3 text-green-500" />
          <span>Loaded from cache</span>
        </>
      ) : (
        <>
          <Zap className="h-3 w-3 text-blue-500" />
          <span>{duration.toFixed(0)}ms</span>
        </>
      )}
    </div>
  );
}