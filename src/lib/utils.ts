import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cleanKpdnText(text: string | null | undefined): string {
  if (!text) return "";

  let cleaned = text;

  const replacements: Record<string, string> = {
    // "Greater than or equal to" corruptions
    "b\t%": "≥",
    "b\\t%": "≥",
    "b t%": "≥",

    // "Less than or equal to" corruptions
    "b\t$": "≤",
    "b\\t$": "≤",
    "b t$": "≤",
  };

  for (const [corrupted, fixed] of Object.entries(replacements)) {
    cleaned = cleaned.split(corrupted).join(fixed);
  }

  return cleaned.replace(/\s{2,}/g, " ").trim();
}
