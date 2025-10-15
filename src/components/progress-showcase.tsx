"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress, CircularProgress, StepProgress } from "@/components/ui/enhanced-progress";

export function ProgressShowcase() {
  const [basicProgress, setBasicProgress] = useState(0);
  const [variantProgress, setVariantProgress] = useState(0);
  const [circularProgress, setCircularProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = ["Setup", "Configure", "Generate", "Complete"];
  const variants = ["default", "success", "warning", "danger", "info"] as const;
  const sizes = ["sm", "default", "lg", "xl"] as const;

  // Auto-animate progress bars
  useEffect(() => {
    const interval = setInterval(() => {
      setBasicProgress((prev) => (prev >= 100 ? 0 : prev + 2));
      setVariantProgress((prev) => (prev >= 100 ? 0 : prev + 1));
      setCircularProgress((prev) => (prev >= 100 ? 0 : prev + 3));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Auto-cycle through steps
  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev >= demoSteps.length - 1 ? 0 : prev + 1));
    }, 2000);

    return () => clearInterval(stepInterval);
  }, []);

  const handleManualProgress = () => {
    setBasicProgress(0);
    setVariantProgress(0);
    setCircularProgress(0);
    setCurrentStep(0);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress Bar Showcase</h1>
        <p className="text-muted-foreground">
          Simple and visually appealing progress bar components for Next.js
        </p>
      </div>

      {/* Basic Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Progress Bar</CardTitle>
          <CardDescription>
            Clean and simple progress bar with smooth animations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress
            value={basicProgress}
            showLabel
            label="Download Progress"
          />
          <div className="flex gap-4">
            <Button onClick={handleManualProgress} variant="outline" size="sm">
              Reset
            </Button>
            <span className="text-sm text-muted-foreground">
              Current: {basicProgress}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Color Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Color Variants</CardTitle>
          <CardDescription>
            Different color schemes for various use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {variants.map((variant) => (
            <div key={variant} className="space-y-2">
              <Progress
                value={variantProgress}
                variant={variant}
                showLabel
                label={`${variant.charAt(0).toUpperCase() + variant.slice(1)} Progress`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Size Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Size Variants</CardTitle>
          <CardDescription>
            Different sizes for various UI contexts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sizes.map((size) => (
            <div key={size} className="space-y-2">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium w-16">
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </span>
                <Progress
                  value={basicProgress}
                  size={size}
                  className="flex-1"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Striped and Animated */}
      <Card>
        <CardHeader>
          <CardTitle>Striped & Animated</CardTitle>
          <CardDescription>
            Visual styles for loading and processing states
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Progress
              value={variantProgress}
              striped
              showLabel
              label="Striped Progress"
            />
          </div>
          <div className="space-y-2">
            <Progress
              value={basicProgress}
              striped
              animated
              showLabel
              label="Animated Striped Progress"
            />
          </div>
        </CardContent>
      </Card>

      {/* Circular Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Circular Progress</CardTitle>
          <CardDescription>
            Circular progress indicator for compact spaces
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-8">
            <CircularProgress value={circularProgress} size={60} />
            <div>
              <h4 className="font-medium">Processing</h4>
              <p className="text-sm text-muted-foreground">
                {circularProgress}% complete
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <CircularProgress value={75} size={40} strokeWidth={3} />
            <CircularProgress value={50} size={40} strokeWidth={3} />
            <CircularProgress value={25} size={40} strokeWidth={3} />
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Step Progress</CardTitle>
          <CardDescription>
            Multi-step progress indicator for workflows
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StepProgress
            steps={demoSteps}
            currentStep={currentStep}
          />
          <div className="text-center text-sm text-muted-foreground">
            Current step: {demoSteps[currentStep]} ({currentStep + 1} of {demoSteps.length})
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
          <CardDescription>
            Code examples for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h4 className="font-medium">File Upload</h4>
            <Progress value={75} variant="info" showLabel label="uploading-file.pdf" />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Loading State</h4>
            <Progress value={basicProgress} striped animated variant="default" />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Success State</h4>
            <Progress value={100} variant="success" showLabel label="Complete!" />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Error State</h4>
            <Progress value={100} variant="danger" showLabel label="Upload Failed" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}