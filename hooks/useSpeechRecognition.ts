"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/hooks/useSettings";
import { SPEECH_LANG } from "@/lib/i18n";

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
}

export function useSpeechRecognition(
  onResult?: (text: string) => void
): UseSpeechRecognitionReturn {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  // Tracks the highest result index already delivered to onResult, guarding
  // against Android Chrome reporting resultIndex=0 after a final result fires.
  const lastFinalIndexRef = useRef(-1);
  const { settings } = useSettings();
  const lang = SPEECH_LANG[settings.locale] ?? "en-US";

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    setIsSupported("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          if (i > lastFinalIndexRef.current) {
            finalText += result[0].transcript;
            lastFinalIndexRef.current = i;
          }
        } else {
          interimText += result[0].transcript;
        }
      }
      const combined = finalText || interimText;
      setTranscript(combined);
      if (finalText) onResultRef.current?.(finalText.trim());
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [isSupported, lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    lastFinalIndexRef.current = -1;
    setIsListening(true);
    recognitionRef.current.start();
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  const reset = useCallback(() => {
    setTranscript("");
  }, []);

  return { transcript, isListening, isSupported, start, stop, reset };
}
