import { createClient } from "@/lib/supabase/server";
import { TopBar } from "@/components/shared/TopBar";
import { Logo } from "@/components/shared/Logo";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RecipeCard } from "@/components/recipes/RecipeCard";

export default async function DashboardRecipesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, description, photo_url, total_calories, total_protein_g, total_carbs_g, total_fat_g")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  const recipeList = recipes ?? [];

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        left={<Logo size="sm" />}
        right={
          <Link href="/recipes/new">
            <Plus className="w-5 h-5 text-foreground" />
          </Link>
        }
      />

      <div className="pt-14 px-6 pb-28 space-y-6">
        <div className="pt-4">
          <h2 className="font-heading font-bold text-heading-lg text-foreground">Mes recettes</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Crée et logue tes recettes habituelles en 1 clic
          </p>
        </div>

        {recipeList.length === 0 ? (
          <div className="bg-surface-container rounded-3xl p-8 text-center space-y-4">
            <p className="text-5xl">📋</p>
            <div className="space-y-1">
              <p className="font-heading font-bold text-foreground">Aucune recette</p>
              <p className="text-muted-foreground text-sm">
                Crée ta première recette pour la loguer rapidement chaque jour
              </p>
            </div>
            <Link
              href="/recipes/new"
              className="inline-block px-6 h-11 rounded-full bg-primary-container text-white font-semibold text-sm leading-[44px] transition-all active:scale-95 hover:opacity-90"
            >
              Créer une recette
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recipeList.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
