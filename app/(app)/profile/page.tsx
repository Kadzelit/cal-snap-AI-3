import { TopBar } from "@/components/shared/TopBar";
import { ChevronRight, Target, Activity, Scale, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/(auth)/actions";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, goal, activity_level")
    .eq("id", user?.id ?? "")
    .single();

  const goalLabel: Record<string, string> = {
    lose: "Perdre du poids",
    maintain: "Maintenir mon poids",
    gain: "Prendre de la masse",
  };
  const activityLabel: Record<string, string> = {
    sedentary: "Sédentaire",
    light: "Légèrement actif",
    active: "Actif",
    very_active: "Très actif",
  };

  const menuItems = [
    {
      icon: Target,
      label: "Mon objectif",
      description: profile?.goal ? goalLabel[profile.goal] : "Non défini",
    },
    {
      icon: Activity,
      label: "Niveau d'activité",
      description: profile?.activity_level ? activityLabel[profile.activity_level] : "Non défini",
    },
    {
      icon: Scale,
      label: "Suivi du poids",
      description: "Ajouter un relevé",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Profil" />

      <div className="pt-14 px-6 pb-6 space-y-6">
        <div className="pt-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-primary-container/20 flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div className="text-center">
            <p className="font-heading font-bold text-heading-md text-foreground">
              {profile?.full_name ?? user?.email?.split("@")[0] ?? "Mon compte"}
            </p>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Repas", value: "0" },
            { label: "Recettes", value: "0" },
            { label: "Streak", value: "0" },
          ].map((stat) => (
            <div key={stat.label} className="bg-surface-container rounded-2xl p-4 text-center">
              <p className="metric text-heading-md text-foreground">{stat.value}</p>
              <p className="label-caps mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          {menuItems.map(({ icon: Icon, label, description }) => (
            <button
              key={label}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface-container text-left transition-all active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-full bg-primary-container/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">{label}</p>
                <p className="text-muted-foreground text-xs">{description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border text-left transition-all active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-destructive" />
            </div>
            <p className="font-semibold text-destructive text-sm">Se déconnecter</p>
          </button>
        </form>
      </div>
    </div>
  );
}
