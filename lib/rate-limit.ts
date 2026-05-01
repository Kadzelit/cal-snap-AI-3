import { createClient } from "@/lib/supabase/server";

const LIMITS = {
  perMinute: 10,
  perDay: 100,
};

type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number; message: string };

export async function checkRateLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();
  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60_000);
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [{ count: countMinute }, { count: countDay }] = await Promise.all([
    supabase
      .from("meals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneMinuteAgo.toISOString()),
    supabase
      .from("meals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString()),
  ]);

  if ((countMinute ?? 0) >= LIMITS.perMinute) {
    return {
      allowed: false,
      retryAfter: 60,
      message: "Trop de scans en ce moment, réessaie dans une minute.",
    };
  }

  if ((countDay ?? 0) >= LIMITS.perDay) {
    const tomorrowMs = new Date(startOfDay.getTime() + 86_400_000).getTime();
    const retryAfter = Math.ceil((tomorrowMs - now.getTime()) / 1000);
    return {
      allowed: false,
      retryAfter,
      message: "Limite journalière atteinte. Réessaie demain.",
    };
  }

  return { allowed: true };
}
