import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeMeal, visionProvider } from "@/lib/ai/vision";
import { checkRateLimit } from "@/lib/rate-limit";
import type { Json } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Fetch user context for personalised prompts
    const { data: profile } = await supabase
      .from("profiles")
      .select("goals_description")
      .eq("id", user.id)
      .single();
    const userContext = profile?.goals_description ?? null;

    // Rate limit check
    const rateLimit = await checkRateLimit(user.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.message },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 });
    }

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("meal-photos")
      .upload(fileName, imageFile, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    }

    const { data: urlData } = supabase.storage.from("meal-photos").getPublicUrl(fileName);
    const photoUrl = uploadData ? urlData.publicUrl : null;

    // Analyze with AI
    let analysis;
    try {
      analysis = await analyzeMeal(photoUrl || base64, userContext);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur IA";
      if (message === "NOT_FOOD") {
        return NextResponse.json(
          { error: "L'image ne semble pas être un repas. Réessaie avec une autre photo." },
          { status: 422 }
        );
      }
      return NextResponse.json({ error: "Analyse impossible. Réessaie." }, { status: 500 });
    }

    // Save meal to database
    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        name: analysis.meal_name,
        photo_url: photoUrl,
        calories: Math.round(analysis.total.calories),
        protein_g: analysis.total.protein_g,
        carbs_g: analysis.total.carbs_g,
        fat_g: analysis.total.fat_g,
        ai_confidence: analysis.confidence,
        ai_provider: visionProvider.name,
        ai_raw_response: analysis as unknown as Json,
      })
      .select()
      .single();

    if (mealError) {
      console.error("Meal save error:", mealError);
      return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
    }

    return NextResponse.json({ id: meal.id, analysis });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
