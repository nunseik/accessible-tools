"use client";
import { useTranslations } from "next-intl";
import { useSettings } from "@/hooks/useSettings";
import { LOCALES } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageControl() {
  const { settings, updateSettings } = useSettings();
  const t = useTranslations("settings");

  return (
    <div className="flex flex-col gap-2" role="group" aria-label={t("language")}>
      {LOCALES.map((l) => (
        <button
          key={l.value}
          onClick={() => updateSettings({ locale: l.value })}
          aria-pressed={settings.locale === l.value}
          lang={l.value}
          className={cn(
            "flex items-center justify-between p-4 rounded-2xl min-h-[4rem] font-medium transition-all focus-visible:ring-4 focus-visible:ring-ring",
            settings.locale === l.value
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          <span>{l.label}</span>
          {settings.locale === l.value && <span aria-hidden="true">✓</span>}
        </button>
      ))}
    </div>
  );
}
