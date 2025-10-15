"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB_ROUTES = [
  { value: "/enhance", label: "Enhance Prompt" },
  { value: "/setup", label: "Setup" },
];

export function NavigationTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const [current, setCurrent] = useState<string>("/enhance");

  useEffect(() => {
    const active = TAB_ROUTES.find((tab) => pathname?.startsWith(tab.value));
    setCurrent(active?.value ?? "/enhance");
  }, [pathname]);

  return (
    <Tabs
      value={current}
      onValueChange={(value) => {
        setCurrent(value);
        router.push(value);
      }}
    >
      <TabsList>
        {TAB_ROUTES.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
