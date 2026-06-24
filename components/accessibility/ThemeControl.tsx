"use client";
import { Sun, Moon, Contrast } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { Settings } from "@/lib/db";

const THEMES: { value: Settings["theme"]; labelKey: string; icon: React.ReactNode }[] = [
  { value: "light",         labelKey: "themeLight",         icon: <Sun className="w-5 h-5" /> },
  { value: "dark",          labelKey: "themeDark",          icon: <Moon className="w-5 h-5" /> },
  { value: "high-contrast", labelKey: "themeHighContrast", icon: <Contrast className="w-5 h-5" /> },
];

export function ThemeControl() {
  const { settings, updateSettings } = useSettings();
  const a11y = useTranslations("a11y");

  return (
    <div className="flex items-center gap-2" role="group" aria-label={a11y("themeGroup")}>
      {THEMES.map((t) => (
        <button
          key={t.value}
          onClick={() => updateSettings({ theme: t.value })}
          aria-label={a11y(t.labelKey)}
          aria-pressed={settings.theme === t.value}
          className={cn(
            "rounded-lg p-3 min-h-[3rem] min-w-[3rem] transition-all focus-visible:ring-4 focus-visible:ring-ring",
            settings.theme === t.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
