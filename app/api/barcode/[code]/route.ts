import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface OpenFoodFactsProduct {
  product_name?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    energy_100g?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
  };
  serving_quantity?: number;
}

interface OpenFoodFactsResponse {
  status: number;
  product?: OpenFoodFactsProduct;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { code } = params;

  if (!/^\d{8,14}$/.test(code)) {
    return NextResponse.json({ error: "Code-barres invalide" }, { status: 400 });
  }

  try {
    const fields = "product_name,nutriments,serving_quantity";
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=${fields}`,
      { headers: { "User-Agent": "CalSnapIA/1.0 (contact@calsnap.app)" } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Erreur Open Food Facts" }, { status: 502 });
    }

    const data: OpenFoodFactsResponse = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json(
        { error: "Produit non trouvé. Essaie de l'entrer manuellement." },
        { status: 404 }
      );
    }

    const product = data.product;
    const n = product.nutriments ?? {};

    const kcal100g = n["energy-kcal_100g"] ?? (n.energy_100g ? n.energy_100g / 4.184 : 0);
    const protein100g = n.proteins_100g ?? 0;
    const carbs100g = n.carbohydrates_100g ?? 0;
    const fat100g = n.fat_100g ?? 0;

    // Default portion = serving_quantity si dispo, sinon 100g
    const servingG = product.serving_quantity ?? 100;
    const ratio = servingG / 100;

    const { data: meal, error: mealError } = await supabase
      .from("meals")
      .insert({
        user_id: user.id,
        name: product.product_name || "Produit scanné",
        calories: Math.round(kcal100g * ratio),
        protein_g: parseFloat((protein100g * ratio).toFixed(1)),
        carbs_g: parseFloat((carbs100g * ratio).toFixed(1)),
        fat_g: parseFloat((fat100g * ratio).toFixed(1)),
        ai_provider: "openfoodfacts",
      })
      .select()
      .single();

    if (mealError) {
      return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
    }

    return NextResponse.json({
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      servingG,
    });
  } catch {
    return NextResponse.json({ error: "Erreur réseau" }, { status: 500 });
  }
}
