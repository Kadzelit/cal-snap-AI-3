import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeTextMeal } from "@/lib/ai/vision";
import { z } from "zod";
import type { Json } from "@/types/database";

const BodySchema = z.object({
  text: z.string().min(2, "Description trop courte").max(500),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    let analysis;
    try {
      analysis = await analyzeTextMeal(parsed.data.text);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur IA";
      if (message === "NOT_FOOD") {
        return NextResponse.json(
          { error: "Ce texte ne décrit pas un repas. Réessaie." },
          { status: 422 }
        );
      }
      return NextResponse.json({ error: "Analyse impossible. Réessaie." }, { status: 500 });
    }

    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        name: analysis.meal_name,
        calories: Math.round(analysis.total.calories),
        protein_g: analysis.total.protein_g,
        carbs_g: analysis.total.carbs_g,
        fat_g: analysis.total.fat_g,
        ai_confidence: analysis.confidence,
        ai_provider: "groq-text",
        ai_raw_response: analysis as unknown as Json,
      })
      .select()
      .single();

    if (mealError) {
      return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
    }

    return NextResponse.json({ id: meal.id, analysis });
  } catch {
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
