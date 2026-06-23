"use client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FontSizeControl } from "@/components/accessibility/FontSizeControl";
import { ThemeControl } from "@/components/accessibility/ThemeControl";
import { useSettings } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="flex flex-col min-h-svh p-4 gap-6">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/" aria-label="Back to home" className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">Settings</h1>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Text Size</h2>
        <FontSizeControl />
        <p className="text-muted-foreground text-sm">
          Changes apply instantly across all tools
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Color Theme</h2>
        <ThemeControl />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-xl">Speech Speed</h2>
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground text-sm w-12">Slow</span>
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.1}
            value={settings.speechRate}
            onChange={(e) => updateSettings({ speechRate: parseFloat(e.target.value) })}
            aria-label="Text-to-speech speed"
            className="flex-1 h-3 accent-primary"
          />
          <span className="text-muted-foreground text-sm w-12 text-right">Fast</span>
        </div>
        <p className="text-muted-foreground text-sm">
          Current: {settings.speechRate.toFixed(1)}×
        </p>
      </section>

      <section className="flex flex-col gap-4 mt-auto pt-4 border-t border-border">
        <p className="text-muted-foreground text-sm text-center">
          AccessiTools — All data stored locally on your device.
          No accounts. No tracking.
        </p>
      </section>
    </div>
  );
}
