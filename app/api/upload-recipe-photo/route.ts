import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("image") as File | null;
  if (!file) return NextResponse.json({ error: "Aucune image" }, { status: 400 });

  const ext = file.type === "image/png" ? "png" : "jpg";
  const fileName = `recipes/${user.id}/${Date.now()}.${ext}`;

  const { data, error } = await supabase.storage
    .from("meal-photos")
    .upload(fileName, file, { contentType: file.type || "image/jpeg", upsert: false });

  if (error || !data) return NextResponse.json({ error: error?.message ?? "Upload échoué" }, { status: 500 });

  const { data: urlData } = supabase.storage.from("meal-photos").getPublicUrl(fileName);
  return NextResponse.json({ url: urlData.publicUrl });
}
