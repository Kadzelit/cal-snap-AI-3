import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PlanPage() {
  // Ces valeurs seront calculées dynamiquement via TDEE
  const plan = {
    calories: 2100,
    protein: 158,
    carbs: 210,
    fat: 70,
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-8">
      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-primary-container/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-primary-container" />
          </div>
          <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
            Ton plan personnalisé !
          </h1>
          <p className="text-muted-foreground text-body-md">
            Basé sur tes informations, voici tes objectifs quotidiens.
          </p>
        </div>

        <div className="bg-surface-container rounded-3xl p-6 space-y-6">
          <div className="text-center">
            <p className="label-caps mb-1">Calories quotidiennes</p>
            <p className="metric text-metric-large text-primary-container">
              {plan.calories}
            </p>
            <p className="text-muted-foreground text-sm">kcal / jour</p>
          </div>

          <div className="h-px bg-border" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="metric text-[28px] text-foreground">{plan.protein}g</p>
              <p className="label-caps mt-1">Protéines</p>
            </div>
            <div>
              <p className="metric text-[28px] text-secondary-container">{plan.carbs}g</p>
              <p className="label-caps mt-1">Glucides</p>
            </div>
            <div>
              <p className="metric text-[28px] text-foreground">{plan.fat}g</p>
              <p className="label-caps mt-1">Lipides</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 bg-surface-low rounded-2xl p-4">
          <p className="font-semibold text-foreground text-sm">Ce plan est basé sur :</p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Formule Mifflin-St Jeor (métabolisme basal)</li>
            <li>• Ton niveau d'activité physique</li>
            <li>• Ton objectif sélectionné</li>
          </ul>
        </div>
      </div>

      <Link
        href="/dashboard"
        className="block w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] text-center leading-[56px] transition-all active:scale-95 hover:opacity-90"
      >
        Commencer le suivi
      </Link>
    </div>
  );
}
