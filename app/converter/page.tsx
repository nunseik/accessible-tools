"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { CATEGORIES, convertAll, formatNumber, type UnitCategory } from "@/lib/conversions";
import { TTSButton } from "@/components/accessibility/TTSButton";
import { cn } from "@/lib/utils";

const CATEGORY_KEYS = Object.keys(CATEGORIES) as UnitCategory[];

export default function ConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("cooking");
  const [fromUnit, setFromUnit] = useState("cup");
  const [value, setValue] = useState("1");
  const t = useTranslations("converter");
  const a11y = useTranslations("a11y");

  const cats = CATEGORIES[category];
  const unitKeys = Object.keys(cats.units);

  function handleCategoryChange(cat: UnitCategory) {
    setCategory(cat);
    setFromUnit(Object.keys(CATEGORIES[cat].units)[0]);
    setValue("1");
  }

  function handleUnitChange(unit: string) {
    setFromUnit(unit);
  }

  const numValue = parseFloat(value) || 0;
  const results = convertAll(numValue, fromUnit, category);

  const ttsText = Object.entries(results)
    .filter(([, v]) => isFinite(v))
    .map(([key, v]) => `${formatNumber(v)} ${t(`units.${key}`)}`)
    .join(", ");

  const fullTtsText = `${value} ${t(`units.${fromUnit}`)} ${t("equals")}: ${ttsText}`;

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <Link
          href="/"
          aria-label={a11y("backToHome")}
          className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{t("title")}</h1>
      </header>

      {/* Category tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none"
        role="group"
        aria-label={t("categoryGroup")}
      >
        {CATEGORY_KEYS.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            aria-pressed={category === cat}
            className={cn(
              "shrink-0 px-4 py-3 rounded-xl font-medium min-h-[3rem] transition-all whitespace-nowrap",
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>

      {/* Number input */}
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label={t("valueToConvert")}
        inputMode="decimal"
        className="w-full bg-secondary rounded-2xl px-4 py-4 text-4xl font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-ring"
      />

      {/* Unit selector as accessible buttons */}
      <div
        className="flex gap-2 flex-wrap"
        role="group"
        aria-label={t("unitFromGroup", { category: t(`categories.${category}`) })}
      >
        {unitKeys.map((key) => (
          <button
            key={key}
            onClick={() => handleUnitChange(key)}
            aria-pressed={fromUnit === key}
            className={cn(
              "px-4 py-3 rounded-xl font-bold min-h-[3rem] transition-all text-lg",
              fromUnit === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cats.units[key].symbol}
          </button>
        ))}
      </div>

      {/* TTS */}
      {numValue > 0 && (
        <TTSButton text={fullTtsText} label={t("readAll")} />
      )}

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        {unitKeys
          .filter((key) => key !== fromUnit)
          .map((key) => {
            const result = results[key];
            const unit = cats.units[key];
            return (
              <div
                key={key}
                className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1"
              >
                <div className="text-muted-foreground text-sm font-medium">
                  {t(`units.${key}`)}
                </div>
                <div className="flex items-baseline gap-1 flex-wrap min-w-0">
                  <span className="text-2xl font-bold leading-tight">
                    {formatNumber(result)}
                  </span>
                  <span className="text-base text-muted-foreground font-normal">
                    {unit.symbol}
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
