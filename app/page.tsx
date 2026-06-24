"use client";
import Link from "next/link";
import { Calculator, NotebookPen, ChefHat, Ruler, Settings } from "lucide-react";
import { useTranslations } from "next-intl";

const TOOLS = [
  {
    href: "/calculator",
    key: "calculator",
    icon: <Calculator className="w-12 h-12" />,
    color: "bg-blue-600 text-white",
  },
  {
    href: "/notes",
    key: "notes",
    icon: <NotebookPen className="w-12 h-12" />,
    color: "bg-emerald-600 text-white",
  },
  {
    href: "/recipes",
    key: "recipes",
    icon: <ChefHat className="w-12 h-12" />,
    color: "bg-orange-500 text-white",
  },
  {
    href: "/converter",
    key: "converter",
    icon: <Ruler className="w-12 h-12" />,
    color: "bg-purple-600 text-white",
  },
];

export default function Home() {
  const t = useTranslations("home");
  const a11y = useTranslations("a11y");
  return (
    <main className="flex flex-col min-h-svh p-4 gap-6">
      <header className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AccessiTools</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Link
          href="/settings"
          aria-label={a11y("openSettings")}
          className="p-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center"
        >
          <Settings className="w-6 h-6" />
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        {TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`
              ${tool.color} rounded-2xl p-5 flex flex-col items-start gap-3
              active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-ring
              min-h-[160px]
            `}
          >
            {tool.icon}
            <div>
              <div className="font-bold text-xl leading-tight">{t(`${tool.key}Label`)}</div>
              <div className="text-sm opacity-85 mt-1 leading-snug">
                {t(`${tool.key}Description`)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground pb-2">
        {t("footer")}
      </p>
    </main>
  );
}
