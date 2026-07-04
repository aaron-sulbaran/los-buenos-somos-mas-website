export type Lang = "en" | "es";

export const DEFAULT_LANG: Lang = "en";

/**
 * Interface chrome strings. Per-row content (ledger descriptions, etc.)
 * comes from dual sheet columns, not from this dictionary.
 */
const dict = {
  "site.name": {
    en: "Los Buenos Somos Más",
    es: "Los Buenos Somos Más",
  },
  "nav.home": { en: "Home", es: "Inicio" },
  "nav.transparency": { en: "Transparency", es: "Transparencia" },
  "nav.support": { en: "Continue the support", es: "Sigue apoyando" },
  "nav.languageLabel": { en: "Language", es: "Idioma" },

  "prompt.title": { en: "Welcome / Bienvenidos", es: "Bienvenidos / Welcome" },
  "prompt.body": {
    en: "Choose your language. You can change it anytime from the top menu.",
    es: "Elige tu idioma. Puedes cambiarlo en cualquier momento desde el menú superior.",
  },
  "prompt.spanish": { en: "Español", es: "Español" },
  "prompt.english": { en: "English", es: "English" },

  "footer.livingDocument": {
    en: "This site is a living document. It reflects the fund's records as they are kept.",
    es: "Este sitio es un documento vivo. Refleja los registros del fondo tal como se llevan.",
  },
  "footer.fundClosed": {
    en: "The fund is closed to new donations.",
    es: "El fondo está cerrado a nuevas donaciones.",
  },

  "common.anonymous": { en: "Anonymous", es: "Anónimo" },
  "common.uncategorized": { en: "General", es: "General" },

  "totals.raised": { en: "Raised", es: "Recaudado" },
  "totals.distributed": { en: "Distributed", es: "Distribuido" },
  "totals.available": { en: "Available", es: "Disponible" },

  "data.unavailable": {
    en: "The financial records are temporarily unavailable. Please check back soon.",
    es: "Los registros financieros no están disponibles por el momento. Vuelve a intentarlo pronto.",
  },
} as const;

export type DictKey = keyof typeof dict;

export function t(key: DictKey, lang: Lang): string {
  return dict[key][lang];
}
