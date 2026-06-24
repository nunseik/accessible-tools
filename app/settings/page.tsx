"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { FontSizeControl } from "@/components/accessibility/FontSizeControl";
import { ThemeControl } from "@/components/accessibility/ThemeControl";
import { LanguageControl } from "@/components/accessibility/LanguageControl";
import { useSettings } from "@/hooks/useSettings";
import { db, EXAMPLE_RECIPES } from "@/lib/db";
import { toast } from "sonner";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const t = useTranslations("settings");
  const a11y = useTranslations("a11y");
  const c = useTranslations("common");

  async function restoreExamples() {
    const existing = await db.recipes.toArray();
    const existingTitles = new Set(existing.map((r) => r.title));
    const toAdd = EXAMPLE_RECIPES.filter((r) => !existingTitles.has(r.title));
    if (toAdd.length === 0) {
      toast.info(t("toastExamplesExist"));
      return;
    }
    await db.recipes.bulkAdd(toAdd.map((r) => ({ ...r, createdAt: new Date() })));
    toast.success(t("toastExamplesRestored", { count: toAdd.length }));
  }

  return (
    <div className="flex flex-col min-h-svh p-4 gap-6">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/" aria-label={a11y("backToHome")} className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{t("title")}</h1>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">{t("textSize")}</h2>
        <FontSizeControl />
        <p className="text-muted-foreground text-sm">
          {t("textSizeHint")}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">{t("colorTheme")}</h2>
        <ThemeControl />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">{t("language")}</h2>
        <LanguageControl />
        <p className="text-muted-foreground text-sm">
          {t("languageHint")}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">{t("speechSpeed")}</h2>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm w-12">{t("slow")}</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            aria-label={t("speechRateAria")}
            className="flex-1 h-3 accent-primary"
          />
          <span className="text-muted-foreground text-sm w-12 text-right">{t("fast")}</span>
        </div>
        <p className="text-muted-foreground text-sm">
          {t("current", { rate: settings.speechRate.toFixed(1) })}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">{t("calculator")}</h2>
        <button
          aria-pressed={settings.autoReadResults}
          onClick={() => updateSettings({ autoReadResults: !settings.autoReadResults })}
          className={`flex items-center justify-between p-4 rounded-2xl min-h-[4rem] transition-all focus-visible:ring-4 focus-visible:ring-ring ${
            settings.autoReadResults
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          <span className="font-medium">{t("readAloudToggle")}</span>
          <span className="text-sm opacity-80">{settings.autoReadResults ? c("on") : c("off")}</span>
        </button>
        <p className="text-muted-foreground text-sm">
          {t("readAloudHint")}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">{t("recipes")}</h2>
        <button
          onClick={restoreExamples}
          className="flex items-center justify-between p-4 rounded-2xl min-h-[4rem] bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all focus-visible:ring-4 focus-visible:ring-ring"
        >
          <span className="font-medium">{t("restoreExamples")}</span>
        </button>
        <p className="text-muted-foreground text-sm">
          {t("restoreHint")}
        </p>
      </section>

      <section className="flex flex-col gap-4 mt-auto pt-4 border-t border-border">
        <p className="text-muted-foreground text-sm text-center">
          {t("footer")}
        </p>
      </section>
    </div>
  );
}
