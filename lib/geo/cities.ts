/**
 * City-to-coordinate lookup for the impact map.
 *
 * Privacy: this map is deliberately coarse. It works at city or
 * municipality granularity only, never finer, and never attaches a name
 * to a person. A ledger row carries a free-text City cell; we fold that
 * text (lowercase, accent-stripped, whitespace-collapsed) and match it
 * against the known coastal towns below. Unknown cities are silently
 * omitted from the map; the ledger row still renders in full.
 */

export type CityCoord = { lat: number; lng: number };

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
 * Maiquetia, Macuto, Naiguata. Coordinates are real world latitude and
 * longitude, plotted on the CARTO vector basemap.
 */
const KNOWN_CITIES: Record<string, KnownCity> = {
  "catia la mar": { label: "Catia La Mar", coord: { lat: 10.598, lng: -67.033 } },
  maiquetia: { label: "Maiquetía", coord: { lat: 10.598, lng: -66.978 } },
  "la guaira": { label: "La Guaira", coord: { lat: 10.6012, lng: -66.931 } },
  macuto: { label: "Macuto", coord: { lat: 10.607, lng: -66.888 } },
  caraballeda: { label: "Caraballeda", coord: { lat: 10.611, lng: -66.849 } },
  naiguata: { label: "Naiguatá", coord: { lat: 10.617, lng: -66.735 } },
  caracas: { label: "Caracas", coord: { lat: 10.4806, lng: -66.9036 } },
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
