import type { Lang } from "./dictionary";

/**
 * Per-row bilingual content rule: Spanish is the canonical cell.
 * English renders only when the English cell has real content;
 * otherwise fall back to Spanish. Never render an empty string.
 */
export function pickLocalized(
  lang: Lang,
  es: string,
  en?: string | null,
): string {
  if (lang === "en" && en && en.trim() !== "") return en.trim();
  return es.trim();
}
