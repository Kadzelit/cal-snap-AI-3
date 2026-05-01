"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { Logo } from "@/components/shared/Logo";
import { signup } from "../actions";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-14 rounded-full bg-primary-container text-white font-heading font-bold text-[17px] transition-all active:scale-95 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending && <Loader2 className="w-5 h-5 animate-spin" />}
      {pending ? "Création du compte..." : "Créer mon compte"}
    </button>
  );
}

export default function SignupPage() {
  const [state, action] = useFormState(signup, null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <Logo size="lg" />
          <p className="text-muted-foreground text-body-md">Crée ton compte gratuitement</p>
        </div>

        {state?.success ? (
          <div className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-primary-container/10 text-center">
            <CheckCircle2 className="w-10 h-10 text-primary-container" />
            <p className="font-semibold text-foreground">{state.success}</p>
            <Link href="/login" className="text-primary font-semibold text-sm underline">
              Aller à la connexion
            </Link>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <label className="label-caps" htmlFor="full_name">Prénom</label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Alexandre"
                autoComplete="given-name"
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

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
                placeholder="8 caractères minimum"
                autoComplete="new-password"
                minLength={8}
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
        )}

        <p className="text-center text-muted-foreground text-sm">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
