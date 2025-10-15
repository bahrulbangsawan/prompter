"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { OptimizedMultiSelect, type OptimizedMultiSelectOption } from "@/components/multi-select-optimized";
import { DEFAULT_TECH_STACK, useSetupStore } from "@/lib/store/setup-store";
import { setupSchema } from "@/lib/schemas/form-schemas";
import type { SetupSchema } from "@/lib/schemas/form-schemas";
import type { TechStack } from "@/types";

// Predefined options for all technology categories
const FRONTEND_OPTIONS: OptimizedMultiSelectOption[] = [
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

const BACKEND_OPTIONS: OptimizedMultiSelectOption[] = [
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

const DATABASE_OPTIONS: OptimizedMultiSelectOption[] = [
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

const TOOLS_OPTIONS: OptimizedMultiSelectOption[] = [
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

const UI_COMPONENTS_OPTIONS: OptimizedMultiSelectOption[] = [
  // Component Libraries
  { value: "shadcn/ui", label: "shadcn/ui" },
  { value: "Radix UI", label: "Radix UI" },
  { value: "Headless UI", label: "Headless UI" },
  { value: "Mantine", label: "Mantine" },
  { value: "Chakra UI", label: "Chakra UI" },
  { value: "Material-UI (MUI)", label: "Material-UI (MUI)" },
  { value: "Ant Design", label: "Ant Design" },
  { value: "Semantic UI", label: "Semantic UI" },
  { value: "React Bootstrap", label: "React Bootstrap" },
  { value: "Reactstrap", label: "Reactstrap" },
  { value: "Blueprint", label: "Blueprint" },
  { value: "Evergreen", label: "Evergreen" },
  { value: "Grommet", label: "Grommet" },
  { value: "Reakit", label: "Reakit" },
  { value: "Bloomer", label: "Bloomer" },
  { value: "PrimeReact", label: "PrimeReact" },
  { value: "KendoReact", label: "KendoReact" },
  { value: "DevExtreme React", label: "DevExtreme React" },
  { value: "Syncfusion React", label: "Syncfusion React" },

  // Design Systems
  { value: "Carbon Design System", label: "Carbon Design System" },
  { value: "Lightning Design System", label: "Lightning Design System" },
  { value: "Clarity Design System", label: "Clarity Design System" },
  { value: "Fluent UI", label: "Fluent UI" },
  { value: "Atlassian Design System", label: "Atlassian Design System" },
  { value: "Nordic Design System", label: "Nordic Design System" },
  { value: "Spectrum", label: "Spectrum" },
  { value: "Polaris", label: "Polaris" },
  { value: "Dawn", label: "Dawn" },
  { value: "Primer", label: "Primer" },
  { value: "Base Web", label: "Base Web" },
  { value: "Gestalt", label: "Gestalt" },

  // CSS Frameworks
  { value: "Tailwind CSS", label: "Tailwind CSS" },
  { value: "Bootstrap", label: "Bootstrap" },
  { value: "Foundation", label: "Foundation" },
  { value: "Bulma", label: "Bulma" },
  { value: "Pure CSS", label: "Pure CSS" },
  { value: "Semantic UI CSS", label: "Semantic UI CSS" },
  { value: "UIKit", label: "UIKit" },
  { value: "Skeleton", label: "Skeleton" },
  { value: "Milligram", label: "Milligram" },
  { value: "Tachyons", label: "Tachyons" },
  { value: "Materialize CSS", label: "Materialize CSS" },
  { value: "Vuetify", label: "Vuetify" },
  { value: "Quasar", label: "Quasar" },
  { value: "Element Plus", label: "Element Plus" },
  { value: "iView", label: "iView" },

  // Animation Libraries
  { value: "Framer Motion", label: "Framer Motion" },
  { value: "React Spring", label: "React Spring" },
  { value: "AutoAnimate", label: "AutoAnimate" },
  { value: "React Transition Group", label: "React Transition Group" },
  { value: "GSAP", label: "GSAP" },
  { value: "Lottie", label: "Lottie" },
  { value: "Animate.css", label: "Animate.css" },
  { value: "AOS", label: "AOS" },
  { value: "Wow.js", label: "Wow.js" },
  { value: "Velocity.js", label: "Velocity.js" },

  // Icon Libraries
  { value: "Lucide React", label: "Lucide React" },
  { value: "Heroicons", label: "Heroicons" },
  { value: "React Icons", label: "React Icons" },
  { value: "Font Awesome", label: "Font Awesome" },
  { value: "Material Icons", label: "Material Icons" },
  { value: "Ionicons", label: "Ionicons" },
  { value: "Feather Icons", label: "Feather Icons" },
  { value: "Boxicons", label: "Boxicons" },
  { value: "SVG React", label: "SVG React" },
  { value: "Remix Icon", label: "Remix Icon" },

  // Form Libraries
  { value: "React Hook Form", label: "React Hook Form" },
  { value: "Formik", label: "Formik" },
  { value: "Final Form", label: "Final Form" },
  { value: "React Final Form", label: "React Final Form" },
  { value: "Redux Form", label: "Redux Form" },
  { value: "FormBuilder", label: "FormBuilder" },
  { value: "React-jsonschema-form", label: "React-jsonschema-form" },

  // Data Visualization
  { value: "Chart.js", label: "Chart.js" },
  { value: "Recharts", label: "Recharts" },
  { value: "Nivo", label: "Nivo" },
  { value: "Victory", label: "Victory" },
  { value: "D3.js", label: "D3.js" },
  { value: "Plotly.js", label: "Plotly.js" },
  { value: "ApexCharts", label: "ApexCharts" },
  { value: "Highcharts", label: "Highcharts" },
  { value: "ECharts", label: "ECharts" },
  { value: "G2", label: "G2" },

  // Calendar & Date Pickers
  { value: "React Calendar", label: "React Calendar" },
  { value: "React Date Picker", label: "React Date Picker" },
  { value: "DayPicker", label: "DayPicker" },
  { value: "FullCalendar", label: "FullCalendar" },
  { value: "BigCalendar", label: "BigCalendar" },
  { value: "Flatpickr", label: "Flatpickr" },
  { value: "Pikaday", label: "Pikaday" },
  { value: "Date-fns", label: "Date-fns" },
  { value: "Moment.js", label: "Moment.js" },
  { value: "Day.js", label: "Day.js" },

  // Tables & Grids
  { value: "React Table", label: "React Table" },
  { value: "AG Grid", label: "AG Grid" },
  { value: "DataTables", label: "DataTables" },
  { value: "React Grid", label: "React Grid" },
  { value: "React Virtualized", label: "React Virtualized" },
  { value: "React Window", label: "React Window" },
  { value: "TanStack Table", label: "TanStack Table" },
  { value: "React Data Grid", label: "React Data Grid" },

  // Modals & Overlays
  { value: "React Modal", label: "React Modal" },
  { value: "React Dialog", label: "React Dialog" },
  { value: "SweetAlert2", label: "SweetAlert2" },
  { value: "React Hot Toast", label: "React Hot Toast" },
  { value: "React Toastify", label: "React Toastify" },
  { value: "Notistack", label: "Notistack" },
  { value: "React Notification", label: "React Notification" },

  // File Upload
  { value: "React Dropzone", label: "React Dropzone" },
  { value: "Uppy", label: "Uppy" },
  { value: "FilePond", label: "FilePond" },
  { value: "React Fine Uploader", label: "React Fine Uploader" },

  // Text Editors
  { value: "React Quill", label: "React Quill" },
  { value: "Slate", label: "Slate" },
  { value: "Draft.js", label: "Draft.js" },
  { value: "TipTap", label: "TipTap" },
  { value: "CKEditor", label: "CKEditor" },
  { value: "TinyMCE", label: "TinyMCE" },
  { value: "Monaco Editor", label: "Monaco Editor" },
  { value: "CodeMirror", label: "CodeMirror" },
  { value: "Ace Editor", label: "Ace Editor" },

  // Carousels & Sliders
  { value: "Swiper", label: "Swiper" },
  { value: "Slick", label: "Slick" },
  { value: "React Slick", label: "React Slick" },
  { value: "Embla Carousel", label: "Embla Carousel" },
  { value: "Flickity", label: "Flickity" },
  { value: "Splide", label: "Splide" },
  { value: "Siema", label: "Siema" },

  // Color Pickers
  { value: "React Color", label: "React Color" },
  { value: "React Colorful", label: "React Colorful" },
  { value: "Chrome Color Picker", label: "Chrome Color Picker" },
  { value: "Sketch Color Picker", label: "Sketch Color Picker" },
  { value: "Material Picker", label: "Material Picker" },

  // Drag & Drop
  { value: "React DnD", label: "React DnD" },
  { value: "Dnd Kit", label: "Dnd Kit" },
  { value: "React Beautiful DnD", label: "React Beautiful DnD" },
  { value: "React Sortable", label: "React Sortable" },
  { value: "Interact.js", label: "Interact.js" },

  // Virtual Reality & 3D
  { value: "React Three Fiber", label: "React Three Fiber" },
  { value: "A-Frame React", label: "A-Frame React" },
  { value: "Babylon.js", label: "Babylon.js" },
  { value: "React 360", label: "React 360" },

  // Mobile UI
  { value: "Ionic React", label: "Ionic React" },
  { value: "Onsen UI", label: "Onsen UI" },
  { value: "Framework7 React", label: "Framework7 React" },
  { value: "React Native Web", label: "React Native Web" },

  // Specialized Components
  { value: "React Flow", label: "React Flow" },
  { value: "React Force Graph", label: "React Force Graph" },
  { value: "React Organizational Chart", label: "React Organizational Chart" },
  { value: "React Timeline", label: "React Timeline" },
  { value: "React Step Progress", label: "React Step Progress" },
  { value: "React Rater", label: "React Rater" },
  { value: "React Rating", label: "React Rating" },
  { value: "React Syntax Highlighter", label: "React Syntax Highlighter" },
  { value: "React Markdown", label: "React Markdown" },
  { value: "React Latex", label: "React Latex" },
];

const categories: Array<{
  key: keyof TechStack;
  label: string;
  placeholder: string;
  helper: string;
  options: OptimizedMultiSelectOption[];
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
    options: UI_COMPONENTS_OPTIONS,
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
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor={`tech-${category.key}`}>{category.label}</Label>
        <p className="text-xs text-muted-foreground">{category.helper}</p>
      </div>
      <OptimizedMultiSelect
        options={category.options}
        onValueChange={onChange}
        defaultValue={items}
        placeholder={category.placeholder}
        disabled={disabled}
        maxCount={5}
        searchable={true}
        className="w-full"
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function SetupForm() {
  const { techStack, setTechStack, resetTechStack } = useSetupStore();
  const { toast } = useToast();

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

  const onSubmit = handleSubmit((data) => {
    setTechStack(data.techStack);
    toast({
      title: "Setup saved",
      description: "Your tech stack preferences are ready to use in prompt enhancements.",
    });
  });

  const handleReset = () => {
    reset({ techStack: DEFAULT_TECH_STACK });
    resetTechStack();
    toast({
      title: "Defaults restored",
      description: "We reverted the configuration to the default stack.",
    });
  };

  const getError = (key: keyof TechStack) => {
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
  };

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