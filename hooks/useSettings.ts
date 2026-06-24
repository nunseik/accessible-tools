"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { db, type Settings } from "@/lib/db";

const DEFAULT_SETTINGS: Settings = {
  id: "singleton",
  fontSize: "large",
  theme: "light",
  speechRate: 0.9,
  voiceURI: "",
  autoReadResults: true,
  locale: "en",
};

export function useSettings() {
  const settings = useLiveQuery(
    () => db.settings.get("singleton"),
    [],
    DEFAULT_SETTINGS
  );

  async function updateSettings(patch: Partial<Omit<Settings, "id">>) {
    await db.settings.update("singleton", patch);
  }

  return { settings: settings ?? DEFAULT_SETTINGS, updateSettings };
}
