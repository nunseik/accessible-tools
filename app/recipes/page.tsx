"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ChefHat } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { useTranslations } from "next-intl";
import { db } from "@/lib/db";
import { toast } from "sonner";

export default function RecipesPage() {
  const t = useTranslations("recipes");
  const a11y = useTranslations("a11y");
  const recipes = useLiveQuery(() =>
    db.recipes.orderBy("createdAt").reverse().toArray()
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (deleting !== id) {
      setDeleting(id);
      setTimeout(() => setDeleting(null), 3000);
      return;
    }
    await db.recipes.delete(id);
    if (navigator.vibrate) navigator.vibrate(100);
    toast.success(t("toastDeleted"));
    setDeleting(null);
  }

  return (
    <div className="flex flex-col min-h-svh p-4 gap-4">
      <header className="flex items-center gap-3 pt-2">
        <Link href="/" aria-label={a11y("backToHome")} className="p-3 rounded-xl bg-secondary hover:bg-secondary/80 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold flex-1">{t("title")}</h1>
        <Link href="/recipes/new" aria-label={t("newAria")}
          className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-4 focus-visible:ring-ring min-h-[3rem] min-w-[3rem] flex items-center justify-center">
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      {(!recipes || recipes.length === 0) ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
          <ChefHat className="w-16 h-16 text-muted-foreground" />
          <p className="text-muted-foreground text-lg">{t("empty")}</p>
          <Link href="/recipes/new"
            className="bg-primary text-primary-foreground rounded-2xl px-6 py-4 font-bold text-xl active:scale-95 transition-transform">
            {t("addFirst")}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <Link href={`/recipes/${recipe.id}`} className="flex-1 min-w-0">
                <h2 className="font-bold text-xl leading-tight">{recipe.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {t("summary", { servings: recipe.servings, ingredients: recipe.ingredients.length, steps: recipe.steps.length })}
                </p>
              </Link>
              <button
                onClick={() => handleDelete(recipe.id!)}
                aria-label={deleting === recipe.id ? t("confirmDelete") : t("deleteAria")}
                className={`p-3 rounded-xl min-h-[3rem] min-w-[3rem] transition-all flex items-center justify-center
                  ${deleting === recipe.id
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
