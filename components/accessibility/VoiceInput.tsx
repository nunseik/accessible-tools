"use client";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface VoiceInputProps {
  onResult: (text: string) => void;
  className?: string;
  size?: "default" | "large";
}

export function VoiceInput({ onResult, className, size = "default" }: VoiceInputProps) {
  const { isListening, isSupported, start, stop } = useSpeechRecognition(onResult);

  if (!isSupported) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Voice input not supported in this browser
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
      aria-label={isListening ? "Stop voice input" : "Start voice input"}
      aria-pressed={isListening}
      className={cn(
        "rounded-full flex items-center justify-center transition-all focus-visible:ring-4 focus-visible:ring-ring",
        size === "large"
          ? "w-24 h-24 text-4xl"
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
