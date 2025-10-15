import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

import { NavigationTabs } from "@/components/navigation-tabs";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Prompt Enhancer",
  description:
    "Transform rough software ideas into AI-ready YAML prompts powered by Grok AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
      >
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <div>
                <Link href="/enhance" className="font-semibold tracking-tight">
                  Prompt Enhancer
                </Link>
                <p className="text-sm text-muted-foreground">
                  Craft crystal-clear prompts that help AI build exactly what you need.
                </p>
              </div>
              <div className="hidden md:block">
                <NavigationTabs />
              </div>
            </div>
            <div className="block border-t border-border bg-background/60 px-4 py-3 md:hidden">
              <div className="mx-auto max-w-5xl">
                <NavigationTabs />
              </div>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
            {children}
          </main>
          <footer className="border-t border-border bg-muted/30">
            <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <span>© {new Date().getFullYear()} Prompt Enhancer.</span>
              <span>Built with Next.js, Tailwind CSS, and shadcn/ui.</span>
            </div>
          </footer>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
