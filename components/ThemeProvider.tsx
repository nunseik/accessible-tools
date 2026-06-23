"use client";
import { useEffect } from "react";
import { useSettings } from "@/hooks/useSettings";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();

  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-fontsize", settings.fontSize);

    html.classList.remove("dark", "high-contrast");
    if (settings.theme === "dark") html.classList.add("dark");
    if (settings.theme === "high-contrast") html.classList.add("high-contrast");
  }, [settings.fontSize, settings.theme]);

  return <>{children}</>;
}
