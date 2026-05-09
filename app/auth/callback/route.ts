import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && user) {
      // Si un `next` explicite est fourni, l'honorer
      if (next) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      // Sinon, vérifier si l'onboarding est déjà fait
      const { data: profile } = await supabase
        .from("profiles")
        .select("daily_calorie_target")
        .eq("id", user.id)
        .single();

      const destination = profile?.daily_calorie_target ? "/dashboard" : "/onboarding/goal";
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
