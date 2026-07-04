import type { Lang } from "./i18n/dictionary";

const LOCALE: Record<Lang, string> = { en: "en-US", es: "es-VE" };

export function formatUsd(amount: number, lang: Lang): string {
  return new Intl.NumberFormat(LOCALE[lang], {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Formats an ISO date string (YYYY-MM-DD) for display. */
export function formatDate(isoDate: string, lang: Lang): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(LOCALE[lang], {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}
