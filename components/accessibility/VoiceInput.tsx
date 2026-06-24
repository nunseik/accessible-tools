"use client";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTranslations } from "next-intl";

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  size?: "default" | "large";
}

export function VoiceInput({ onResult, className, size = "default" }: VoiceInputProps) {
  const { isListening, isSupported, start, stop } = useSpeechRecognition(onResult);
  const t = useTranslations("a11y");

  if (!isSupported) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        {t("voiceUnsupported")}
      </p>
    );
  }

  const handleToggle = () => {
    if (isListening) stop();
    else start();
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isListening ? t("stopVoice") : t("startVoice")}
      aria-pressed={isListening}
      className={cn(
        "rounded-full flex items-center justify-center transition-all focus-visible:ring-4 focus-visible:ring-ring",
        size === "large"
          ? "w-32 h-32 text-5xl"
          : "w-16 h-16 text-2xl",
        isListening
          ? "bg-destructive text-destructive-foreground animate-pulse shadow-lg shadow-destructive/40"
          : "bg-primary text-primary-foreground hover:opacity-90 active:scale-95",
        className
      )}
    >
      {isListening ? <MicOff className="w-1/2 h-1/2" /> : <Mic className="w-1/2 h-1/2" />}
    </button>
  );
}
