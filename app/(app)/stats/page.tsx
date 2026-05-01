import { TopBar } from "@/components/shared/TopBar";

export default function StatsPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Statistiques" />

      <div className="pt-14 px-6 pb-6 space-y-6">
        <div className="pt-4 space-y-4">
          {/* Streak */}
          <div className="bg-surface-container rounded-3xl p-5 flex items-center justify-between">
            <div>
              <p className="label-caps">Streak actuel</p>
              <p className="metric text-heading-lg text-foreground mt-1">0 jour</p>
            </div>
            <span className="text-4xl">🔥</span>
          </div>

          {/* This week */}
          <div className="bg-surface-container rounded-3xl p-5 space-y-4">
            <p className="font-heading font-bold text-heading-md">Cette semaine</p>
            <div className="flex justify-between items-end gap-1 h-24">
              {["L", "M", "M", "J", "V", "S", "D"].map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-surface-highest"
                    style={{ height: `${Math.random() * 60 + 20}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-semibold">{day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Macros average */}
          <div className="bg-surface-container rounded-3xl p-5 space-y-3">
            <p className="font-heading font-bold text-heading-md">Moyennes 7 jours</p>
            <p className="text-muted-foreground text-sm">
              Commence à tracker pour voir tes statistiques ici.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
