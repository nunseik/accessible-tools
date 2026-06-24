import type { Locale } from "@/lib/db";

import en from "@/locales/en.json";
import ptBR from "@/locales/pt-BR.json";
import es from "@/locales/es.json";

export type Messages = typeof en;

export const DEFAULT_LOCALE: Locale = "en";

/** All supported locales, in the order shown in the language switcher. */
export const LOCALES: { value: Locale; label: string }[] = [
  { value: "en", label: "English" },
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
];

/** Statically bundled messages — no async chunk, so offline caching stays simple. */
export const MESSAGES: Record<Locale, Messages> = {
  en,
  "pt-BR": ptBR as Messages,
  es: es as Messages,
};

/**
 * Maps an app locale to a BCP-47 tag for the Web Speech API
 * (SpeechRecognition.lang and SpeechSynthesisUtterance.lang).
 */
export const SPEECH_LANG: Record<Locale, string> = {
  en: "en-US",
  "pt-BR": "pt-BR",
  es: "es-ES",
};

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "pt-BR" || value === "es";
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE];
}
