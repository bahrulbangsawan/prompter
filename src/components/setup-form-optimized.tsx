"use client";

import { useState, useMemo, lazy, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { DEFAULT_TECH_STACK, useSetupStore } from "@/lib/store/setup-store";
import { setupSchema } from "@/lib/schemas/form-schemas";
import type { SetupSchema } from "@/lib/schemas/form-schemas";
import type { TechStack } from "@/types";
import { PerformanceMonitor } from "@/lib/performance/monitoring";

// Lazy load the optimized multi-select component
const OptimizedMultiSelect = lazy(() => import("@/components/multi-select-optimized"));

// Lazy load UI components data
const loadUIComponentsData = () => import("@/data/ui-components-data").then(mod => mod.UI_COMPONENTS_OPTIONS);

// Predefined options for non-UI components (smaller, frequently used)
const FRONTEND_OPTIONS = [
  { value: "React", label: "React" },
  { value: "Next.js", label: "Next.js" },
  { value: "Vue.js", label: "Vue.js" },
  { value: "Angular", label: "Angular" },
  { value: "Svelte", label: "Svelte" },
  { value: "Remix", label: "Remix" },
  { value: "Gatsby", label: "Gatsby" },
  { value: "Astro", label: "Astro" },
  { value: "Solid.js", label: "Solid.js" },
  { value: "Qwik", label: "Qwik" },
  { value: "TypeScript", label: "TypeScript" },
  { value: "JavaScript", label: "JavaScript" },
];

const BACKEND_OPTIONS = [
  { value: "Node.js", label: "Node.js" },
  { value: "Express.js", label: "Express.js" },
  { value: "NestJS", label: "NestJS" },
  { value: "Fastify", label: "Fastify" },
  { value: "Koa", label: "Koa" },
  { value: "Django", label: "Django" },
  { value: "Flask", label: "Flask" },
  { value: "FastAPI", label: "FastAPI" },
  { value: "Ruby on Rails", label: "Ruby on Rails" },
  { value: "Laravel", label: "Laravel" },
  { value: "Spring Boot", label: "Spring Boot" },
  { value: "ASP.NET Core", label: "ASP.NET Core" },
  { value: "Go", label: "Go" },
  { value: "Rust", label: "Rust" },
  { value: "Python", label: "Python" },
];

const DATABASE_OPTIONS = [
  { value: "PostgreSQL", label: "PostgreSQL" },
  { value: "MySQL", label: "MySQL" },
  { value: "MongoDB", label: "MongoDB" },
  { value: "Redis", label: "Redis" },
  { value: "SQLite", label: "SQLite" },
  { value: "Elasticsearch", label: "Elasticsearch" },
  { value: "Cassandra", label: "Cassandra" },
  { value: "DynamoDB", label: "DynamoDB" },
  { value: "Supabase", label: "Supabase" },
  { value: "PlanetScale", label: "PlanetScale" },
  { value: "Neon", label: "Neon" },
  { value: "Prisma", label: "Prisma" },
  { value: "Drizzle ORM", label: "Drizzle ORM" },
  { value: "TypeORM", label: "TypeORM" },
];

const TOOLS_OPTIONS = [
  { value: "TypeScript", label: "TypeScript" },
  { value: "Vite", label: "Vite" },
  { value: "Webpack", label: "Webpack" },
  { value: "Docker", label: "Docker" },
  { value: "Kubernetes", label: "Kubernetes" },
  { value: "Vercel", label: "Vercel" },
  { value: "Netlify", label: "Netlify" },
  { value: "AWS", label: "AWS" },
  { value: "Google Cloud", label: "Google Cloud" },
  { value: "Azure", label: "Azure" },
  { value: "GitHub Actions", label: "GitHub Actions" },
  { value: "GitLab CI/CD", label: "GitLab CI/CD" },
  { value: "Tailwind CSS", label: "Tailwind CSS" },
  { value: "shadcn/ui", label: "shadcn/ui" },
  { value: "Storybook", label: "Storybook" },
  { value: "Jest", label: "Jest" },
  { value: "Cypress", label: "Cypress" },
  { value: "Playwright", label: "Playwright" },
  { value: "ESLint", label: "ESLint" },
  { value: "Prettier", label: "Prettier" },
  { value: "Husky", label: "Husky" },
  { value: "Zustand", label: "Zustand" },
  { value: "React Hook Form", label: "React Hook Form" },
  { value: "Redux Toolkit", label: "Redux Toolkit" },
  { value: "TanStack Query", label: "TanStack Query" },
  { value: "SWR", label: "SWR" },
];

const categories: Array<{
  key: keyof TechStack;
  label: string;
  placeholder: string;
  helper: string;
  options: any[];
  isLazy?: boolean;
  enableVirtualScrolling?: boolean;
}> = [
  {
    key: "frontend",
    label: "Frontend technologies",
    placeholder: "Select frontend technologies (frameworks, languages, etc.)",
    helper: "Required. Choose one or more frontend technologies including frameworks and languages",
    options: FRONTEND_OPTIONS,
  },
  {
    key: "backend",
    label: "Backend technologies",
    placeholder: "Select backend technologies",
    helper: "Optional. Choose backend frameworks, languages, and runtime environments",
    options: BACKEND_OPTIONS,
  },
  {
    key: "database",
    label: "Database technologies",
    placeholder: "Select database technologies",
    helper: "Optional. Choose databases, ORMs, and data storage solutions",
    options: DATABASE_OPTIONS,
  },
  {
    key: "tools",
    label: "Development tools & services",
    placeholder: "Select additional tools and services",
    helper: "Optional. Choose development tools, deployment platforms, and additional services",
    options: TOOLS_OPTIONS,
  },
  {
    key: "uiComponents",
    label: "UI Components & Libraries",
    placeholder: "Select UI components, libraries, and design systems",
    helper: "Optional. Choose UI component libraries, design systems, and visual development tools",
    options: [], // Will be loaded lazily
    isLazy: true,
    enableVirtualScrolling: true,
  },
];

interface TechStackFieldProps {
  items: string[];
  category: (typeof categories)[number];
  onChange: (items: string[]) => void;
  error?: string;
  disabled?: boolean;
}

function TechStackField({ items, category, onChange, error, disabled }: TechStackFieldProps) {
  const [options, setOptions] = useState(category.options);
  const [isLoading, setIsLoading] = useState(category.isLazy || false);

  // Load UI components data lazily
  React.useEffect(() => {
    if (category.isLazy && options.length === 0) {
      PerformanceMonitor.start('load-ui-components-data');
      loadUIComponentsData().then(data => {
        setOptions(data);
        setIsLoading(false);
        PerformanceMonitor.end('load-ui-components-data');
      });
    }
  }, [category.isLazy, options.length]);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={`tech-${category.key}`}>{category.label}</Label>
        <p className="text-xs text-muted-foreground">{category.helper}</p>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <div className="flex flex-wrap gap-1">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-6 w-20" />
            ))}
          </div>
        </div>
      ) : (
        <Suspense
          fallback={
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-6 w-20" />
                ))}
              </div>
            </div>
          }
        >
          <OptimizedMultiSelect
            options={options}
            onValueChange={onChange}
            defaultValue={items}
            placeholder={category.placeholder}
            disabled={disabled}
            maxCount={5}
            searchable={true}
            className="w-full"
            virtualScrolling={category.enableVirtualScrolling}
            virtualHeight={300}
          />
        </Suspense>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SetupFormOptimized() {
  const { techStack, setTechStack, resetTechStack } = useSetupStore();
  const { toast } = useToast();

  PerformanceMonitor.start('setup-form-initialization');

  const {
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SetupSchema>({
    resolver: zodResolver(setupSchema),
    mode: "onChange",
    defaultValues: { techStack },
  });

  const values = watch("techStack", techStack);

  // Memoize form submission handler
  const onSubmit = useMemo(() => handleSubmit((data) => {
    PerformanceMonitor.start('form-submission');
    setTechStack(data.techStack);
    toast({
      title: "Setup saved",
      description: "Your tech stack preferences are ready to use in prompt enhancements.",
    });
    PerformanceMonitor.end('form-submission');
  }), [handleSubmit, setTechStack, toast]);

  // Memoize reset handler
  const handleReset = useMemo(() => () => {
    PerformanceMonitor.start('form-reset');
    reset({ techStack: DEFAULT_TECH_STACK });
    resetTechStack();
    toast({
      title: "Defaults restored",
      description: "We reverted the configuration to the default stack.",
    });
    PerformanceMonitor.end('form-reset');
  }, [reset, resetTechStack, toast]);

  // Memoize error handler
  const getError = useMemo(() => (key: keyof TechStack) => {
    const techErrors = errors.techStack as Record<string, unknown> | undefined;
    const errorValue = techErrors?.[key];
    if (!errorValue) return undefined;
    if (typeof errorValue === "string") return errorValue;
    if (Array.isArray(errorValue)) {
      const first = errorValue.find(Boolean);
      return typeof first === "string"
        ? first
        : typeof (first as { message?: string })?.message === "string"
          ? (first as { message?: string }).message
          : undefined;
    }
    if (
      typeof errorValue === "object" &&
      errorValue !== null &&
      "message" in errorValue &&
      typeof (errorValue as { message?: string }).message === "string"
    ) {
      return (errorValue as { message?: string }).message;
    }
    if (
      typeof errorValue === "object" &&
      errorValue !== null &&
      "root" in errorValue &&
      typeof (errorValue as { root?: { message?: string } }).root?.message === "string"
    ) {
      return (errorValue as { root?: { message?: string } }).root?.message;
    }
    return undefined;
  }, [errors.techStack]);

  PerformanceMonitor.end('setup-form-initialization');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Setup</CardTitle>
        <CardDescription>
          Configure the technologies that best represent your current project.
          We use this information to tailor the enhanced prompts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          {categories.map((category, index) => (
            <div key={category.key} className="space-y-4">
              <TechStackField
                category={category}
                items={values?.[category.key] ?? []}
                onChange={(items) =>
                  setValue(`techStack.${category.key}`, items, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                error={getError(category.key)}
                disabled={isSubmitting}
              />
              {index < categories.length - 1 && <Separator />}
            </div>
          ))}
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Reset to defaults
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save configuration"}
            </Button>
          </div>
        </form>
        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Current configuration</p>
          <ul className="mt-2 space-y-1">
            {categories.map((category) => (
              <li key={category.key}>
                <span className="font-semibold text-foreground">{category.label}:</span>{" "}
                {(values?.[category.key] ?? []).join(", ") || "Not specified"}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}