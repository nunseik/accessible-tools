"use client";
import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, Play, Square } from "lucide-react";
import { db, type Recipe } from "@/lib/db";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SCALE_OPTIONS = [
  { label: "½×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "3×", value: 3 },
];

function formatAmount(amount: number, scale: number): string {
  const scaled = amount * scale;
  return parseFloat(scaled.toPrecision(4)).toString();
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [scale, setScale] = useState(1);
  const [tab, setTab] = useState("ingredients");
  const [cookStep, setCookStep] = useState(0);
  const { speak, stop, isSpeaking } = useTextToSpeech();

  useEffect(() => {
    db.recipes.get(parseInt(id)).then((r) => {
      if (!r) { router.push("/recipes"); return; }
      setRecipe(r);
    });
  }, [id, router]);

  const handleVoiceCommand = useCallback((text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("next")) {
      setCookStep((s) => Math.min(s + 1, (recipe?.steps.length ?? 1) - 1));
    } else if (lower.includes("back") || lower.includes("previous")) {
      setCookStep((s) => Math.max(s - 1, 0));
    } else if (lower.includes("repeat")) {
      if (recipe) speak(recipe.steps[cookStep]);
    }
  }, [recipe, cookStep, speak]);

  const { isListening, start: startListen, stop: stopListen } = useSpeechRecognition(handleVoiceCommand);

  function handleCookModeStep(idx: number) {
    setCookStep(idx);
    if (recipe) speak(recipe.steps[idx]);
  }

  function toggleCookMode() {
    if (tab === "cook") {
      setTab("steps");
      stop();
      stopListen();
    } else {
      setTab("cook");
      setCookStep(0);
      if (recipe) speak(recipe.steps[0]);
      startListen();
    }
  }

  if (!recipe) {
    return <div className="flex items-center justify-center min-h-svh">
      <p className="text-muted-foreground">Loading…</p>
    </div>;
  }

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/recipes" aria-label="Back to recipes" className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1 truncate">{recipe.title}</h1>
        <button
          onClick={toggleCookMode}
          aria-label={tab === "cook" ? "Exit cook mode" : "Enter cook mode"}
          aria-pressed={tab === "cook"}
          className={`px-4 py-3 rounded-xl font-bold min-h-[3rem] transition-all focus-visible:ring-4 focus-visible:ring-ring flex items-center gap-2
            ${tab === "cook" ? "bg-orange-500 text-white" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
        >
          {tab === "cook" ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {tab === "cook" ? "Stop" : "Cook"}
        </button>
      </header>

      {tab === "cook" ? (
        /* Cook mode: TTS step-by-step */
        <div className="flex flex-col flex-1 gap-6">
          <div className="text-center text-muted-foreground font-medium">
            Step {cookStep + 1} of {recipe.steps.length}
            {isListening && <span className="ml-2 text-green-600 dark:text-green-400">· Listening…</span>}
          </div>

          <div className="flex-1 bg-secondary rounded-2xl p-6 flex items-center justify-center">
            <p className="text-2xl leading-relaxed text-center">{recipe.steps[cookStep]}</p>
          </div>

          <p className="text-center text-sm text-muted-foreground">Say "next", "back", or "repeat"</p>

          <div className="flex gap-4">
            <button
              onClick={() => handleCookModeStep(Math.max(cookStep - 1, 0))}
              disabled={cookStep === 0}
              aria-label="Previous step"
              className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground rounded-2xl py-5 font-bold text-xl min-h-[4rem] disabled:opacity-40 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" /> Back
            </button>
            <button
              onClick={() => speak(recipe.steps[cookStep])}
              aria-label="Read step aloud"
              className="p-4 bg-primary text-primary-foreground rounded-2xl min-h-[4rem] min-w-[4rem] flex items-center justify-center active:scale-95 transition-all"
            >
              🔊
            </button>
            <button
              onClick={() => handleCookModeStep(Math.min(cookStep + 1, recipe.steps.length - 1))}
              disabled={cookStep === recipe.steps.length - 1}
              aria-label="Next step"
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-2xl py-5 font-bold text-xl min-h-[4rem] disabled:opacity-40 active:scale-95 transition-all"
            >
              Next <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      ) : (
        <>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="w-full">
              <TabsTrigger value="ingredients" className="flex-1">Ingredients</TabsTrigger>
              <TabsTrigger value="steps" className="flex-1">Steps</TabsTrigger>
            </TabsList>
          </Tabs>

          {tab === "ingredients" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="font-medium text-muted-foreground">Scale:</span>
                <div className="flex gap-2">
                  {SCALE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setScale(opt.value)}
                      aria-pressed={scale === opt.value}
                      className={`px-4 py-2 rounded-xl font-bold min-h-[3rem] transition-all
                        ${scale === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-muted-foreground text-sm">
                For {recipe.servings * scale} serving{recipe.servings * scale !== 1 ? "s" : ""}
              </p>

              <div className="flex flex-col gap-2">
                {recipe.ingredients.length === 0 ? (
                  <p className="text-muted-foreground">No ingredients added.</p>
                ) : recipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
                    <span className="font-bold text-xl min-w-[3rem] text-right">
                      {formatAmount(ing.amount, scale)}
                    </span>
                    {ing.unit && <span className="text-muted-foreground text-lg">{ing.unit}</span>}
                    <span className="text-xl">{ing.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "steps" && (
            <div className="flex flex-col gap-3">
              {recipe.steps.map((step, i) => (
                <div key={i} className="bg-secondary rounded-2xl p-4 flex gap-3">
                  <span className="font-bold text-2xl text-muted-foreground shrink-0 w-8">{i + 1}</span>
                  <p className="text-xl leading-relaxed">{step}</p>
                </div>
              ))}
              {recipe.source && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Recipe from {recipe.source}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
