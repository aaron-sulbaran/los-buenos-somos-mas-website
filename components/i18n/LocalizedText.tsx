"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { pickLocalized } from "@/lib/i18n/fallback";

/**
 * Renders bilingual content in the active language with Spanish fallback.
 * The primitive for all per-row and drafted copy outside the dictionary.
 */
export function LocalizedText({ es, en }: { es: string; en?: string }) {
  const { lang } = useLanguage();
  return <>{pickLocalized(lang, es, en)}</>;
}
