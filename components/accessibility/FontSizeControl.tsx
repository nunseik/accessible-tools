"use client";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { Settings } from "@/lib/db";

const SIZES: { value: Settings["fontSize"]; labelKey: string; display: string }[] = [
  { value: "normal",  labelKey: "fontSizeNormal",  display: "A" },
  { value: "large",   labelKey: "fontSizeLarge",   display: "A" },
  { value: "xlarge",  labelKey: "fontSizeXLarge",  display: "A" },
  { value: "huge",    labelKey: "fontSizeHuge",    display: "A" },
];

export function FontSizeControl() {
  const { settings, updateSettings } = useSettings();
  const a11y = useTranslations("a11y");

  return (
    <div className="flex items-center gap-2" role="group" aria-label={a11y("fontSizeGroup")}>
      {SIZES.map((s, i) => (
        <button
          key={s.value}
          onClick={() => updateSettings({ fontSize: s.value })}
          aria-label={a11y(s.labelKey)}
          aria-pressed={settings.fontSize === s.value}
          className={cn(
            "rounded-lg px-3 py-2 font-bold transition-all focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem]",
            settings.fontSize === s.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
          style={{ fontSize: `${14 + i * 4}px` }}
        >
          {s.display}
        </button>
      ))}
    </div>
  );
}
