import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-8 py-16">
      <div className="w-full max-w-sm space-y-12 flex-1 flex flex-col justify-center">
        <div className="text-center space-y-4">
          <Logo size="lg" />
          <h1 className="font-heading font-extrabold text-display-xl text-foreground leading-tight">
            Bienvenue !
          </h1>
          <p className="text-muted-foreground text-body-lg leading-relaxed">
            Photographie ton repas et laisse l'IA calculer calories et macros en quelques secondes.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container">
            <span className="text-2xl">📸</span>
            <div>
              <p className="font-heading font-bold text-foreground">Photo instantanée</p>
              <p className="text-muted-foreground text-sm">Analyse ton assiette en 3 secondes</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-heading font-bold text-foreground">Objectifs personnalisés</p>
              <p className="text-muted-foreground text-sm">Calories et macros calculés pour toi</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container">
            <span className="text-2xl">📈</span>
            <div>
              <p className="font-heading font-bold text-foreground">Progression visible</p>
              <p className="text-muted-foreground text-sm">Graphiques et tendances en temps réel</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <Link
          href="/onboarding/goal"
          className="block w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] text-center leading-[56px] transition-all active:scale-95 hover:opacity-90"
        >
          Commencer
        </Link>
        <Link
          href="/login"
          className="block w-full h-12 rounded-full text-muted-foreground font-semibold text-sm text-center leading-[48px] transition-colors hover:text-foreground"
        >
          J'ai déjà un compte
        </Link>
      </div>
    </div>
  );
}
