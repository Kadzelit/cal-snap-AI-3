"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Apple, Camera, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { AddMealSheet } from "./AddMealSheet";

const LEFT_NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { href: "/dashboard-recipes", icon: Apple, label: "Recettes" },
];

const RIGHT_NAV = [
  { href: "/stats", icon: BarChart2, label: "Stats" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {LEFT_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 min-w-[48px] py-1"
                aria-label={label}
              >
                <Icon className={cn("w-5 h-5 stroke-2 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-semibold transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
              </Link>
            );
          })}

          {/* FAB */}
          <button
            onClick={() => setSheetOpen(true)}
            className="relative -top-5 flex flex-col items-center"
            aria-label="Ajouter un repas"
          >
            <span className="flex items-center justify-center w-14 h-14 rounded-full bg-primary-container shadow-card-hover transition-transform active:scale-95">
              <Camera className="w-7 h-7 text-white stroke-2" />
            </span>
          </button>

          {RIGHT_NAV.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-0.5 min-w-[48px] py-1"
                aria-label={label}
              >
                <Icon className={cn("w-5 h-5 stroke-2 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-semibold transition-colors", isActive ? "text-primary" : "text-muted-foreground")}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AddMealSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
