/**
 * City-to-coordinate lookup for the impact map.
 *
 * Privacy: this map is deliberately coarse. It works at city or
 * municipality granularity only, never finer, and never attaches a name
 * to a person. A ledger row carries a free-text City cell; we fold that
 * text (lowercase, accent-stripped, whitespace-collapsed) and match it
 * against the known coastal towns below. Unknown cities are silently
 * omitted from the map; the ledger row still renders in full.
 *
 * Coordinates live in the map's own SVG viewBox, not in latitude and
 * longitude. They were placed with a simple linear projection of the real
 * north-central coast: longitude runs west (small x) to east (large x),
 * latitude runs north (small y) to south (large y), so the seven coastal
 * towns form a shallow arc along the top and Caracas drops inland below.
 * Approximate placement is intentional; this is an orientation aid, not a
 * survey.
 */

export type CityCoord = { x: number; y: number };

/** The SVG coordinate space every coordinate below is expressed in. */
export const MAP_VIEWBOX = { width: 400, height: 240 } as const;

type KnownCity = {
  /** Canonical display label. City names are proper nouns, not translated. */
  label: string;
  coord: CityCoord;
};

/** Unicode range of combining diacritical marks, stripped after NFD. */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/**
 * Folds a city string to a match key: lowercase, accents removed,
 * surrounding and repeated whitespace collapsed. So "Maiquetía" and
 * "  maiquetia " both resolve to "maiquetia".
 */
export function normalizeCityName(name: string): string {
  return name
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Known towns keyed by their folded name. At least the affected
 * north-central coast: Caracas, La Guaira, Caraballeda, Catia La Mar,
 * Maiquetia, Macuto, Naiguata.
 */
const KNOWN_CITIES: Record<string, KnownCity> = {
  "catia la mar": { label: "Catia La Mar", coord: { x: 60, y: 90 } },
  maiquetia: { label: "Maiquetía", coord: { x: 108, y: 90 } },
  "la guaira": { label: "La Guaira", coord: { x: 156, y: 88 } },
  macuto: { label: "Macuto", coord: { x: 186, y: 82 } },
  caraballeda: { label: "Caraballeda", coord: { x: 234, y: 80 } },
  naiguata: { label: "Naiguatá", coord: { x: 340, y: 74 } },
  caracas: { label: "Caracas", coord: { x: 186, y: 176 } },
};

/** Returns the map coordinate for a city cell, or null if unknown. */
export function lookupCityCoord(name: string): CityCoord | null {
  const match = KNOWN_CITIES[normalizeCityName(name)];
  return match ? match.coord : null;
}

/** Returns the canonical display label for a city cell, or null if unknown. */
export function lookupCityLabel(name: string): string | null {
  const match = KNOWN_CITIES[normalizeCityName(name)];
  return match ? match.label : null;
}
