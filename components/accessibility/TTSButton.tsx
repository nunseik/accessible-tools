"use client";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

interface TTSButtonProps {
  text: string;
  className?: string;
  label?: string;
}

export function TTSButton({ text, className, label = "Read aloud" }: TTSButtonProps) {
  const { speak, stop, isSpeaking, isSupported } = useTextToSpeech();

  if (!isSupported) return null;

  const handleToggle = () => {
    if (isSpeaking) stop();
    else speak(text);
  };

  return (
    <button
      onClick={handleToggle}
      aria-label={isSpeaking ? "Stop reading" : label}
      aria-pressed={isSpeaking}
      className={cn(
        "flex items-center gap-2 rounded-xl px-4 py-3 min-h-[3rem] font-medium transition-all",
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-95",
        "focus-visible:ring-4 focus-visible:ring-ring",
        isSpeaking && "bg-primary text-primary-foreground",
        className
      )}
    >
      {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      <span>{isSpeaking ? "Stop" : label}</span>
    </button>
  );
}
