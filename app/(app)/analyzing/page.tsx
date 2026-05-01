export default function AnalyzingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-8">
      <div className="w-full max-w-sm space-y-10 text-center">
        {/* Shimmer food icon */}
        <div className="relative mx-auto w-32 h-32 rounded-3xl bg-surface-container overflow-hidden">
          <div className="shimmer absolute inset-0" />
          <div className="relative z-10 flex items-center justify-center h-full text-5xl">
            🍽️
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="font-heading font-extrabold text-heading-lg text-foreground">
            Analyse en cours...
          </h1>
          <p className="text-muted-foreground text-body-md">
            L'IA identifie les aliments et calcule les valeurs nutritionnelles.
          </p>
        </div>

        {/* Animated dots */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-primary-container animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <p className="text-muted-foreground text-sm">
          Généralement moins de 5 secondes
        </p>
      </div>
    </div>
  );
}
