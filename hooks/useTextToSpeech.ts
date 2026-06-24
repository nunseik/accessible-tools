"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SPEECH_LANG } from "@/lib/i18n";

interface UseTextToSpeechReturn {
  speak: (text: string, rate?: number) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

/**
 * Picks the best available voice for a BCP-47 language tag.
 * Prefers an exact match (e.g. "pt-BR"), then any voice sharing the base
 * language (e.g. "pt"), then falls back to the browser default (null).
 * This matters because setting only `utterance.lang` is not enough — most
 * browsers keep speaking with the default (usually English) voice unless a
 * matching voice is explicitly assigned.
 */
function pickVoice(
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const base = lang.split("-")[0].toLowerCase();
  const exact = voices.find((v) => v.lang.toLowerCase() === lang.toLowerCase());
  if (exact) return exact;
  const sameLang = voices.find((v) => v.lang.toLowerCase().startsWith(base));
  return sameLang ?? null;
}

export function useTextToSpeech(): UseTextToSpeechReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { settings } = useSettings();
  const lang = SPEECH_LANG[settings.locale] ?? "en-US";

  useEffect(() => {
    setIsSupported("speechSynthesis" in window);
    if (!("speechSynthesis" in window)) return;

    // Voices populate asynchronously on most browsers — read them now and
    // again on the voiceschanged event.
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback(
    (text: string, rate = settings.speechRate) => {
      if (!isSupported || !text.trim()) return;
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.lang = lang;
      const voice = pickVoice(voices, lang);
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, lang, voices, settings.speechRate]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}
