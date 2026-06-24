"use client";
import { useEffect } from "react";
import { NextIntlClientProvider } from "next-intl";
import { useSettings } from "@/hooks/useSettings";
import { getMessages, SPEECH_LANG } from "@/lib/i18n";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const locale = settings.locale;

  // Keep the <html lang> attribute in sync for screen readers and the
  // browser's own language heuristics. The server renders lang="en"; this
  // updates it on the client once the stored preference is known.
  useEffect(() => {
    document.documentElement.lang = SPEECH_LANG[locale] ?? "en";
  }, [locale]);

  return (
    <NextIntlClientProvider locale={locale} messages={getMessages(locale)}>
      {children}
    </NextIntlClientProvider>
  );
}
