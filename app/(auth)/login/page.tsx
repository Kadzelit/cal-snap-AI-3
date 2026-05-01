"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { login } from "../actions";
import { AlertCircle, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending && <Loader2 className="w-5 h-5 animate-spin" />}
      {pending ? "Connexion..." : "Se connecter"}
    </button>
  );
}

export default function LoginPage() {
  const [state, action] = useFormState(login, null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <p className="text-muted-foreground text-body-md">Connexion à ton compte</p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <label className="label-caps" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="ton@email.com"
              autoComplete="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="label-caps" htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {state?.error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <SubmitButton />
        </form>

        <p className="text-center text-muted-foreground text-sm">
          Pas encore de compte ?{" "}
          <Link href="/signup" className="text-primary font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}
