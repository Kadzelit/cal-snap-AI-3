import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeBody } from "@/lib/ai/vision";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "Aucune image fournie" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const fileName = `${user.id}/${Date.now()}.jpg`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("body-photos")
      .upload(fileName, imageFile, { contentType: "image/jpeg", upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError);
    }

    const { data: urlData } = supabase.storage.from("body-photos").getPublicUrl(fileName);
    const photoUrl = uploadData ? urlData.publicUrl : null;

    // Convert to base64 for vision model
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    // Analyze with AI
    let analysis;
    try {
      analysis = await analyzeBody(photoUrl || base64);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur IA";
      if (message === "NOT_VISIBLE") {
        return NextResponse.json(
          { error: "Le corps n'est pas clairement visible. Essaie avec une photo en sous-vêtements ou tenue de sport." },
          { status: 422 }
        );
      }
      if (message === "NOT_PERSON") {
        return NextResponse.json(
          { error: "L'image ne semble pas être une personne." },
          { status: 422 }
        );
      }
      return NextResponse.json({ error: "Analyse impossible. Réessaie." }, { status: 500 });
    }

    return NextResponse.json({ analysis, photoUrl });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ error: "Erreur serveur inattendue" }, { status: 500 });
  }
}
