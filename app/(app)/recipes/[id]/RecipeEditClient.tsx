"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/shared/TopBar";
import { ChevronLeft, Plus, Trash2 } from "lucide-react";
import { PhotoPicker } from "@/components/recipes/PhotoPicker";
import { updateRecipe } from "./actions";

type Ingredient = {
  id: string;
  name: string;
  quantity_g: number;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

type Props = {
  recipeId: string;
  initialName: string;
  initialDescription: string;
  initialPhotoUrl: string | null;
  initialIngredients: Ingredient[];
};

export function RecipeEditClient({
  recipeId,
  initialName,
  initialDescription,
  initialPhotoUrl,
  initialIngredients,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [photoUrl, setPhotoUrl] = useState<string | null>(initialPhotoUrl);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [isPending, startTransition] = useTransition();

  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", quantity_g: 100, calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    ]);

  const removeIngredient = (id: string) =>
    setIngredients((prev) => prev.filter((i) => i.id !== id));

  const updateIngredient = (id: string, field: keyof Omit<Ingredient, "id">, value: string) =>
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id
          ? { ...ing, [field]: field === "name" ? value : Number(value) || 0 }
          : ing
      )
    );

  const totals = ingredients.reduce(
    (acc, ing) => ({
      calories: acc.calories + ing.calories,
      protein_g: acc.protein_g + ing.protein_g,
      carbs_g: acc.carbs_g + ing.carbs_g,
      fat_g: acc.fat_g + ing.fat_g,
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );

  const handleSave = () => {
    if (!name.trim()) return;
    startTransition(async () => {
      await updateRecipe(recipeId, { name, description, photo_url: photoUrl, ingredients });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        title="Modifier la recette"
        left={
          <button onClick={() => router.back()}>
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        }
      />

      <div className="pt-14 px-6 pb-40 space-y-6">
        {/* ── Photo ── */}
        <div className="pt-4">
          <PhotoPicker initialUrl={initialPhotoUrl} onUpload={setPhotoUrl} />
        </div>

        {/* ── Champs ── */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="label-caps">Nom de la recette</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="label-caps">Description (optionnel)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
            />
          </div>
        </div>

        {/* Totaux */}
        {ingredients.length > 0 && (
          <div className="bg-surface-container rounded-2xl p-4 grid grid-cols-4 gap-2 text-center">
            <div>
              <p className="metric text-[18px] text-foreground">{Math.round(totals.calories)}</p>
              <p className="label-caps">kcal</p>
            </div>
            <div>
              <p className="metric text-[18px] text-primary-container">{Math.round(totals.protein_g)}g</p>
              <p className="label-caps">Prot.</p>
            </div>
            <div>
              <p className="metric text-[18px] text-secondary-container">{Math.round(totals.carbs_g)}g</p>
              <p className="label-caps">Glu.</p>
            </div>
            <div>
              <p className="metric text-[18px] text-muted-foreground">{Math.round(totals.fat_g)}g</p>
              <p className="label-caps">Lip.</p>
            </div>
          </div>
        )}

        {/* Ingrédients */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-heading-md">Ingrédients</h3>
            <button
              onClick={addIngredient}
              className="flex items-center gap-1.5 text-primary font-semibold text-sm"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {ingredients.length === 0 && (
            <div className="bg-surface-container rounded-2xl p-6 text-center space-y-2">
              <p className="text-2xl">🥑</p>
              <p className="text-muted-foreground text-sm">Ajoute les ingrédients de ta recette</p>
            </div>
          )}

          {ingredients.map((ing) => (
            <div key={ing.id} className="bg-surface-container rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={ing.name}
                  onChange={(e) => updateIngredient(ing.id, "name", e.target.value)}
                  placeholder="Nom de l'ingrédient"
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button onClick={() => removeIngredient(ing.id)} className="p-2">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {(
                  [
                    { field: "quantity_g", label: "Qté (g)" },
                    { field: "calories", label: "kcal" },
                    { field: "protein_g", label: "Prot." },
                    { field: "carbs_g", label: "Glu." },
                    { field: "fat_g", label: "Lip." },
                  ] as { field: keyof Omit<Ingredient, "id" | "name">; label: string }[]
                ).map(({ field, label }) => (
                  <div key={field} className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </label>
                    <input
                      type="number"
                      value={ing[field] || ""}
                      onChange={(e) => updateIngredient(ing.id, field, e.target.value)}
                      placeholder="0"
                      min={0}
                      className="w-full px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-background via-background/90 pt-8">
        <button
          onClick={handleSave}
          disabled={!name.trim() || isPending}
          className="w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Enregistrement..." : "Sauvegarder les modifications"}
        </button>
      </div>
    </div>
  );
}
