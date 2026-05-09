import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup"];
const AUTH_ROUTES = ["/login", "/signup"];
// Routes qui nécessitent un profil complet (onboarding terminé)
const REQUIRES_PROFILE = [
  "/dashboard", "/scan", "/analyzing", "/meal",
  "/recipes", "/stats", "/profile", "/dashboard-recipes",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const requiresProfile = REQUIRES_PROFILE.some((r) => pathname.startsWith(r));

  // Utilisateur connecté sur une page auth → dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Utilisateur non connecté → login
  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Utilisateur connecté sur une route app → vérifier que l'onboarding est complet
  if (user && requiresProfile) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("daily_calorie_target")
      .eq("id", user.id)
      .single();

    if (!profile?.daily_calorie_target) {
      return NextResponse.redirect(new URL("/onboarding/goal", request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|apple-icon.png|icon.png|icons|api).*)"],
};
