"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { useTranslations } from "next-intl";
import { db, type Ingredient } from "@/lib/db";
import { toast } from "sonner";

export default function NewRecipePage() {
  const t = useTranslations("recipes");
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [servings, setServings] = useState("2");
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: 1, unit: "" },
  ]);
  const [steps, setSteps] = useState(["", ""]);

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: "", amount: 1, unit: "" }]);
  }

  function updateIngredient(i: number, field: keyof Ingredient, value: string | number) {
    setIngredients((prev) => prev.map((ing, idx) =>
      idx === i ? { ...ing, [field]: value } : ing
    ));
  }

  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));
  }

  function addStep() {
    setSteps((prev) => [...prev, ""]);
  }

  function updateStep(i: number, value: string) {
    setSteps((prev) => prev.map((s, idx) => idx === i ? value : s));
  }

  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!title.trim()) {
      toast.error(t("toastNeedTitle"));
      return;
    }
    const validIngredients = ingredients.filter((i) => i.name.trim());
    const validSteps = steps.filter((s) => s.trim());
    if (validSteps.length === 0) {
      toast.error(t("toastNeedStep"));
      return;
    }
    await db.recipes.add({
      title: title.trim(),
      servings: parseInt(servings) || 1,
      ingredients: validIngredients,
      steps: validSteps,
      createdAt: new Date(),
    });
    toast.success(t("toastSaved"));
    router.push("/recipes");
  }

  return (
    <div className="flex flex-col min-h-svh p-4 gap-6">
      <datalist id="units">
        <option value="tsp" /><option value="tbsp" /><option value="cup" />
        <option value="oz" /><option value="lb" /><option value="g" />
        <option value="kg" /><option value="ml" /><option value="l" />
        <option value="pinch" /><option value="clove" /><option value="slice" />
        <option value="can" /><option value="bunch" /><option value="piece" />
      </datalist>
      <header className="flex items-center gap-3 pt-2">
        <Link href="/recipes" aria-label={t("backToRecipes")} className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{t("newTitle")}</h1>
        <button onClick={handleSave} aria-label={t("saveAria")}
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <Save className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col gap-3">
        <label className="font-bold text-lg">{t("nameLabel")}</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder={t("namePlaceholder")}
          aria-label={t("nameLabel")}
          className="w-full bg-secondary rounded-xl px-4 py-3 text-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
      </div>

      <div className="flex flex-col gap-3">
        <label className="font-bold text-lg">{t("servingsLabel")}</label>
        <input type="number" value={servings} onChange={(e) => setServings(e.target.value)}
          min={1} aria-label={t("servingsAria")}
          className="w-32 bg-secondary rounded-xl px-4 py-3 text-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-lg">{t("ingredientsLabel")}</label>
          <button onClick={addIngredient} aria-label={t("addIngredientAria")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 min-h-[3rem] text-sm font-medium">
            <Plus className="w-4 h-4" /> {t("add")}
          </button>
        </div>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex flex-col gap-2 bg-secondary/50 rounded-2xl p-3">
            <div className="flex gap-2">
              <input type="number" value={ing.amount} onChange={(e) => updateIngredient(i, "amount", parseFloat(e.target.value) || 0)}
                aria-label={t("amountAria", { n: i + 1 })}
                className="w-24 bg-secondary rounded-xl px-3 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
              <input value={ing.unit} onChange={(e) => updateIngredient(i, "unit", e.target.value)}
                placeholder={t("unitPlaceholder")}
                list="units"
                aria-label={t("unitAria", { n: i + 1 })}
                className="flex-1 bg-secondary rounded-xl px-3 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
            </div>
            <div className="flex gap-2">
              <input value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)}
                placeholder={t("ingredientNamePlaceholder")}
                aria-label={t("nameOfAria", { n: i + 1 })}
                className="flex-1 bg-secondary rounded-xl px-3 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-ring" />
              {ingredients.length > 1 && (
                <button onClick={() => removeIngredient(i)} aria-label={t("removeIngredientAria", { n: i + 1 })}
                  className="p-3 rounded-xl bg-destructive/15 text-destructive min-h-[3rem] min-w-[3rem] flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="font-bold text-lg">{t("stepsLabel")}</label>
          <button onClick={addStep} aria-label={t("addStepAria")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary hover:bg-secondary/80 min-h-[3rem] text-sm font-medium">
            <Plus className="w-4 h-4" /> {t("add")}
          </button>
        </div>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="font-bold text-muted-foreground text-lg pt-3 w-8 shrink-0">{i + 1}.</span>
            <textarea value={step} onChange={(e) => updateStep(i, e.target.value)}
              placeholder={t("stepPlaceholder", { n: i + 1 })}
              aria-label={t("stepAria", { n: i + 1 })}
              rows={2}
              className="flex-1 bg-secondary rounded-xl px-3 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-ring resize-none" />
            {steps.length > 1 && (
              <button onClick={() => removeStep(i)} aria-label={`Remove step ${i + 1}`}
                className="p-3 rounded-xl bg-destructive/15 text-destructive min-h-[3rem] min-w-[3rem] flex items-center justify-center mt-1">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button onClick={handleSave}
        className="w-full bg-primary text-primary-foreground rounded-2xl py-4 font-bold text-xl active:scale-95 transition-transform focus-visible:ring-4 focus-visible:ring-ring min-h-[4rem] mb-4">
        Save Recipe
      </button>
    </div>
  );
}
