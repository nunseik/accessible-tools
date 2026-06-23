"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { TTSButton } from "@/components/accessibility/TTSButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CalcMode = "standard" | "cooking" | "construction";

const COOKING_FRACTIONS = ["½", "⅓", "¼", "⅔", "¾"];
const COOKING_UNITS = ["tsp", "tbsp", "cup", "oz"];
const CONSTRUCTION_UNITS = ["in", "ft", "yd", "cm", "m"];

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

export default function CalculatorPage() {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState("");
  const [op, setOp] = useState("");
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [mode, setMode] = useState<CalcMode>("standard");
  const [unit, setUnit] = useState("");

  const input = useCallback((digit: string) => {
    setDisplay((d) => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return digit;
      }
      if (d === "0" && digit !== ".") return digit;
      if (digit === "." && d.includes(".")) return d;
      return d + digit;
    });
  }, [waitingForOperand]);

  const calculate = useCallback(() => {
    if (!op || !prev) return;
    const a = parseFraction(prev);
    const b = parseFraction(display);
    let result: number;
    switch (op) {
      case "+": result = a + b; break;
      case "−": result = a - b; break;
      case "×": result = a * b; break;
      case "÷": result = b !== 0 ? a / b : NaN; break;
      case "%": result = a % b; break;
      default: return;
    }
    const formatted = isNaN(result) ? "Error" : parseFloat(result.toPrecision(10)).toString();
    setDisplay(formatted);
    setPrev("");
    setOp("");
    setWaitingForOperand(true);
  }, [op, prev, display]);

  const setOperator = useCallback((operator: string) => {
    if (op && !waitingForOperand) calculate();
    setPrev(display);
    setOp(operator);
    setWaitingForOperand(true);
  }, [op, waitingForOperand, display, calculate]);

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

  const displayLabel = `${prev ? prev + " " + op + " " : ""}${display}${unit ? " " + unit : ""}`;

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/" aria-label="Back to home" className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">Calculator</h1>
      </header>

      <Tabs value={mode} onValueChange={(v) => setMode(v as CalcMode)}>
        <TabsList className="w-full">
          <TabsTrigger value="standard" className="flex-1">Standard</TabsTrigger>
          <TabsTrigger value="cooking" className="flex-1">Cooking</TabsTrigger>
          <TabsTrigger value="construction" className="flex-1">Build</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Display */}
      <div className="bg-secondary rounded-2xl p-4 text-right">
        {prev && op && (
          <div className="text-muted-foreground text-lg mb-1">{prev} {op}</div>
        )}
        <div className="text-5xl font-bold tracking-tight break-all leading-tight">
          {display}
          {unit && <span className="text-2xl text-muted-foreground ml-2">{unit}</span>}
        </div>
        <div className="mt-2 flex justify-end">
          <TTSButton text={displayLabel} label="Read result" />
        </div>
      </div>

      {/* Unit selector for cooking/construction */}
      {mode === "cooking" && (
        <div className="flex gap-2 flex-wrap">
          {COOKING_UNITS.map((u) => (
            <button key={u} onClick={() => setUnit(unit === u ? "" : u)}
              aria-pressed={unit === u}
              className={cn("px-3 py-2 rounded-xl font-medium text-sm min-h-[3rem] transition-all",
                unit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}>
              {u}
            </button>
          ))}
        </div>
      )}
      {mode === "construction" && (
        <div className="flex gap-2 flex-wrap">
          {CONSTRUCTION_UNITS.map((u) => (
            <button key={u} onClick={() => setUnit(unit === u ? "" : u)}
              aria-pressed={unit === u}
              className={cn("px-3 py-2 rounded-xl font-medium text-sm min-h-[3rem] transition-all",
                unit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}>
              {u}
            </button>
          ))}
        </div>
      )}

      {/* Fraction buttons for cooking */}
      {mode === "cooking" && (
        <div className="grid grid-cols-5 gap-2">
          {COOKING_FRACTIONS.map((f) => (
            <CalcButton key={f} label={f} onClick={() => { setDisplay(f); setWaitingForOperand(true); }} variant="special" />
          ))}
        </div>
      )}

      {/* Main keypad */}
      <div className="grid grid-cols-4 gap-3 flex-1">
        <CalcButton label="AC" onClick={clear} variant="clear" />
        <CalcButton label="+/−" onClick={toggleSign} variant="special" />
        <CalcButton label="⌫" onClick={backspace} variant="special" />
        <CalcButton label="÷" onClick={() => setOperator("÷")} variant="operator" />

        <CalcButton label="7" onClick={() => input("7")} />
        <CalcButton label="8" onClick={() => input("8")} />
        <CalcButton label="9" onClick={() => input("9")} />
        <CalcButton label="×" onClick={() => setOperator("×")} variant="operator" />

        <CalcButton label="4" onClick={() => input("4")} />
        <CalcButton label="5" onClick={() => input("5")} />
        <CalcButton label="6" onClick={() => input("6")} />
        <CalcButton label="−" onClick={() => setOperator("−")} variant="operator" />

        <CalcButton label="1" onClick={() => input("1")} />
        <CalcButton label="2" onClick={() => input("2")} />
        <CalcButton label="3" onClick={() => input("3")} />
        <CalcButton label="+" onClick={() => setOperator("+")} variant="operator" />

        <CalcButton label="." onClick={() => input(".")} />
        <CalcButton label="0" onClick={() => input("0")} />
        <CalcButton label="%" onClick={() => setOperator("%")} variant="special" />
        <CalcButton label="=" onClick={calculate} variant="equals" />
      </div>
    </div>
  );
}
