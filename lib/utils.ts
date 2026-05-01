import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCalories(value: number): string {
  return new Intl.NumberFormat("fr-FR").format(Math.round(value));
}

export function formatMacro(value: number): string {
  return `${Math.round(value)}g`;
}

export function getMealTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation",
  };
  return labels[type] ?? type;
}

export function getMealTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    breakfast: "🌅",
    lunch: "☀️",
    dinner: "🌙",
    snack: "🍎",
  };
  return emojis[type] ?? "🍽️";
}
