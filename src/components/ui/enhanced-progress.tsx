/**
 * Enhanced Progress Component
 * Simple, visually appealing progress bar with multiple variants and sizes
 */

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

// Progress bar variants
const progressVariants = {
  default: "bg-secondary",
  success: "bg-green-100 dark:bg-green-900/30",
  warning: "bg-yellow-100 dark:bg-yellow-900/30",
  danger: "bg-red-100 dark:bg-red-900/30",
  info: "bg-blue-100 dark:bg-blue-900/30",
};

// Progress indicator variants
const indicatorVariants = {
  default: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

// Progress bar sizes
const progressSizes = {
  sm: "h-2",
  default: "h-3",
  lg: "h-4",
  xl: "h-6",
};

export interface EnhancedProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number;
  max?: number;
  variant?: keyof typeof progressVariants;
  size?: keyof typeof progressSizes;
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  animated?: boolean;
}

const EnhancedProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  EnhancedProgressProps
>(({
  className,
  value = 0,
  max = 100,
  variant = "default",
  size = "default",
  showLabel = false,
  label,
  striped = false,
  animated = false,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full space-y-2", className)}>
      {/* Progress Label */}
      {(showLabel || label) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="font-medium text-foreground">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-full transition-all duration-300 ease-in-out",
          progressVariants[variant],
          progressSizes[size]
        )}
        value={value}
        max={max}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            indicatorVariants[variant],
            // Striped pattern
            striped && [
              "bg-[length:1rem_1rem]",
              "bg-[linear-gradient(45deg,transparent_25%,currentColor_25%,currentColor_50%,transparent_50%,transparent_75%,currentColor_75%,currentColor)]",
              variant === "default" && "bg-primary/80",
            ],
            // Animated stripes
            animated && striped && "animate-pulse"
          )}
          style={{
            transform: `translateX(-${100 - percentage}%)`,
            width: `${percentage}%`
          }}
        />
      </ProgressPrimitive.Root>
    </div>
  );
});
EnhancedProgress.displayName = "EnhancedProgress";

// Preset variants for common use cases
export const CircularProgress = ({
  value = 0,
  size = 40,
  strokeWidth = 4,
  className,
  ...props
}: {
  value?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted opacity-20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-primary transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {value}%
      </div>
    </div>
  );
};

export const StepProgress = ({
  steps,
  currentStep,
  className
}: {
  steps: string[];
  currentStep: number;
  className?: string;
}) => {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-4">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={index} className="flex items-center">
              {/* Step indicator */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors duration-200",
                  isActive && "bg-primary text-primary-foreground",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              {/* Step label */}
              <span
                className={cn(
                  "ml-2 text-sm font-medium hidden sm:block",
                  isActive && "text-foreground",
                  isCompleted && "text-green-600 dark:text-green-400",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                {step}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-full h-0.5 mx-4 transition-colors duration-200",
                    isCompleted ? "bg-green-500" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { EnhancedProgress as Progress };
export default EnhancedProgress;