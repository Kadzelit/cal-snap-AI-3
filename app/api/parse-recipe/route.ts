import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const description: string = body.description ?? "";
  if (!description.trim())
    return NextResponse.json({ error: "Description vide" }, { status: 400 });

  const response = await groq.chat.completions.create({
    model: process.env.GROQ_TEXT_MODEL || "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Tu es un nutritionniste expert. Voici une description verbale d'une recette ou liste d'ingrédients :

"${description}"

Extrait tous les ingrédients mentionnés avec leurs valeurs nutritionnelles estimées pour les quantités indiquées.
Si aucune quantité n'est précisée, utilise une portion standard réaliste.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown ni texte autour :
{
  "recipe_name": "Nom court et descriptif de la recette en français",
  "ingredients": [
    {
      "name": "nom de l'ingrédient en français",
      "quantity_g": 100,
      "calories": 150,
      "protein_g": 5.0,
      "carbs_g": 20.0,
      "fat_g": 3.0
    }
  ]
}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 1024,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return NextResponse.json({ error: "Réponse vide" }, { status: 500 });

  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return NextResponse.json({ error: "JSON invalide" }, { status: 500 });

  try {
    const parsed = JSON.parse(match[0]);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Parsing échoué" }, { status: 500 });
  }
}
