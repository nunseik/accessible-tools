"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSettings } from "@/hooks/useSettings";

const FRACTIONS = ["½", "⅓", "¼", "⅔", "¾"];

function CalcButton({
  label,
  onClick,
  variant = "default",
  wide = false,
}: {
  label: string;
  onClick: () => void;
  variant?: "default" | "operator" | "equals" | "clear" | "special";
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "rounded-2xl font-bold text-2xl flex items-center justify-center",
        "min-h-[64px] transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-ring select-none",
        wide && "col-span-2",
        variant === "default" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant === "operator" && "bg-primary/15 text-primary hover:bg-primary/25",
        variant === "equals" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "clear" && "bg-destructive/15 text-destructive hover:bg-destructive/25",
        variant === "special" && "bg-muted text-muted-foreground hover:bg-muted/80 text-lg",
      )}
    >
      {label}
    </button>
  );
}

function parseFraction(s: string): number {
  const map: Record<string, number> = {
    "½": 0.5, "⅓": 1/3, "¼": 0.25, "⅔": 2/3, "¾": 0.75,
  };
  return map[s] ?? parseFloat(s);
}

function computeResult(prev: string, op: string, current: string): string {
  const a = parseFraction(prev);
  const b = parseFraction(current);
  let result: number;
  switch (op) {
    case "+": result = a + b; break;
    case "−": result = a - b; break;
    case "×": result = a * b; break;
    case "÷": result = b !== 0 ? a / b : NaN; break;
    case "%": result = a % b; break;
    default: return current;
  }
  return isNaN(result) ? "Error" : parseFloat(result.toPrecision(10)).toString();
}

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState("");
  const [op, setOp] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const { settings } = useSettings();
  const { speak, isSupported: ttsSupported } = useTextToSpeech();
  const t = useTranslations("calculator");
  const c = useTranslations("common");
  const a11y = useTranslations("a11y");

  const TTS_LABELS: Record<string, string> = {
    "÷": t("tts.divide"), "×": t("tts.times"), "−": t("tts.minus"), "+": t("tts.plus"), "%": t("tts.percent"),
    "⌫": t("tts.delete"), "AC": t("tts.clear"), "+/−": t("tts.plusMinus"), ".": t("tts.point"),
    "½": t("tts.oneHalf"), "⅓": t("tts.oneThird"), "¼": t("tts.oneQuarter"), "⅔": t("tts.twoThirds"), "¾": t("tts.threeQuarters"),
  };

  const speakKey = useCallback((key: string) => {
    if (!settings.autoReadResults || !ttsSupported) return;
    speak(TTS_LABELS[key] ?? key, settings.speechRate);
  }, [settings, ttsSupported, speak]);

  const input = useCallback((digit: string) => {
    if (waitingForOperand) {
      setWaitingForOperand(false);
      setDisplay(digit === "." ? "0." : digit);
      return;
    }
    setDisplay((d) => {
      if ((d === "0" || FRACTIONS.includes(d)) && digit !== ".") return digit;
      if (digit === "." && d.includes(".")) return d;
      return d + digit;
    });
  }, [waitingForOperand]);

  const calculate = useCallback(() => {
    if (!op || !prev) return;
    const formatted = computeResult(prev, op, display);
    setDisplay(formatted);
    setPrev("");
    setOp("");
    setWaitingForOperand(true);
    if (settings.autoReadResults && ttsSupported) {
      speak(formatted === "Error" ? c("error") : formatted, settings.speechRate);
    }
  }, [op, prev, display, settings, ttsSupported, speak, c]);

  const setOperator = useCallback((operator: string) => {
    let currentDisplay = display;
    if (op && !waitingForOperand) {
      const result = computeResult(prev, op, display);
      setDisplay(result);
      currentDisplay = result;
    }
    setPrev(currentDisplay);
    setOp(operator);
    setWaitingForOperand(true);
  }, [op, waitingForOperand, display, prev]);

  const clear = () => {
    setDisplay("0");
    setPrev("");
    setOp("");
    setWaitingForOperand(false);
  };

  const backspace = () => {
    setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : "0"));
  };

  const toggleSign = () => {
    setDisplay((d) => (d.startsWith("-") ? d.slice(1) : "-" + d));
  };

  const shownDisplay = display === "Error" ? c("error") : display;

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <h1 className="sr-only">{t("title")}</h1>

      {/* Display — back button lives in top-left corner */}
      <div className="bg-secondary rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <Link href="/" aria-label={a11y("backToHome")} className="p-2 rounded-xl hover:bg-background/40 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center shrink-0 mt-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 text-right">
            {prev && op && (
              <div className="text-muted-foreground text-lg mb-1">{prev} {op}</div>
            )}
            <div
              className="text-5xl font-bold tracking-tight break-all leading-tight"
              aria-live="polite"
              aria-atomic="true"
            >
              {shownDisplay}
            </div>
          </div>
        </div>
      </div>

      {/* Fraction buttons */}
      <div className="grid grid-cols-5 gap-2">
        {FRACTIONS.map((f) => (
          <CalcButton key={f} label={f} onClick={() => { speakKey(f); setDisplay(f); setWaitingForOperand(false); }} variant="special" />
        ))}
      </div>

      {/* Main keypad */}
      <div className="grid grid-cols-4 gap-3 flex-1">
        <CalcButton label="AC" onClick={() => { speakKey("AC"); clear(); }} variant="clear" />
        <CalcButton label="+/−" onClick={() => { speakKey("+/−"); toggleSign(); }} variant="special" />
        <CalcButton label="⌫" onClick={() => { speakKey("⌫"); backspace(); }} variant="special" />
        <CalcButton label="÷" onClick={() => { speakKey("÷"); setOperator("÷"); }} variant="operator" />

        <CalcButton label="7" onClick={() => { speakKey("7"); input("7"); }} />
        <CalcButton label="8" onClick={() => { speakKey("8"); input("8"); }} />
        <CalcButton label="9" onClick={() => { speakKey("9"); input("9"); }} />
        <CalcButton label="×" onClick={() => { speakKey("×"); setOperator("×"); }} variant="operator" />

        <CalcButton label="4" onClick={() => { speakKey("4"); input("4"); }} />
        <CalcButton label="5" onClick={() => { speakKey("5"); input("5"); }} />
        <CalcButton label="6" onClick={() => { speakKey("6"); input("6"); }} />
        <CalcButton label="−" onClick={() => { speakKey("−"); setOperator("−"); }} variant="operator" />

        <CalcButton label="1" onClick={() => { speakKey("1"); input("1"); }} />
        <CalcButton label="2" onClick={() => { speakKey("2"); input("2"); }} />
        <CalcButton label="3" onClick={() => { speakKey("3"); input("3"); }} />
        <CalcButton label="+" onClick={() => { speakKey("+"); setOperator("+"); }} variant="operator" />

        <CalcButton label="." onClick={() => { speakKey("."); input("."); }} />
        <CalcButton label="0" onClick={() => { speakKey("0"); input("0"); }} />
        <CalcButton label="%" onClick={() => { speakKey("%"); setOperator("%"); }} variant="special" />
        <CalcButton label="=" onClick={calculate} variant="equals" />
      </div>
    </div>
  );
}
