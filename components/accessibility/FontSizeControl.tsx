"use client";
import { useSettings } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";
import type { Settings } from "@/lib/db";

const SIZES: { value: Settings["fontSize"]; label: string; display: string }[] = [
  { value: "normal",  label: "Normal text size",  display: "A" },
  { value: "large",   label: "Large text size",   display: "A" },
  { value: "xlarge",  label: "Extra large text",  display: "A" },
  { value: "huge",    label: "Huge text size",    display: "A" },
];

export function FontSizeControl() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Text size">
      {SIZES.map((s, i) => (
        <button
          key={s.value}
          onClick={() => updateSettings({ fontSize: s.value })}
          aria-label={s.label}
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
