import type { MoneyOut } from "@/lib/sheets/types";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import {
  lookupCityCoord,
  lookupCityLabel,
  normalizeCityName,
} from "@/lib/geo/cities";
import { ImpactMapMount } from "./ImpactMapMount";
import type { ImpactMapPoint } from "./ImpactMapClient";

/**
 * Aggregates distributions by known city. Rows with no city, or a city we
 * cannot place, are silently dropped from the map (the ledger still shows
 * them). Privacy: only a city label and a count ever reach the screen.
 */
function collectCities(rows: MoneyOut[]): ImpactMapPoint[] {
  const byKey = new Map<string, ImpactMapPoint>();
  for (const row of rows) {
    if (!row.city) continue;
    const coord = lookupCityCoord(row.city);
    const label = lookupCityLabel(row.city);
    if (!coord || !label) continue;
    const key = normalizeCityName(row.city);
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      byKey.set(key, { key, label, lat: coord.lat, lng: coord.lng, count: 1 });
    }
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count);
}

export function ImpactMap({ rows }: { rows: MoneyOut[] }) {
  const cities = collectCities(rows);

  if (cities.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted">
        <LocalizedText
          es="Todavía no hay entregas con una ciudad registrada para ubicar en el mapa."
          en="No distributions with a recorded city to place on the map yet."
        />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card p-4 sm:p-6">
      {/* Flag motif: a 4px tricolor hairline down the card's left edge. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex w-1 flex-col"
      >
        <span className="flex-1 bg-accent-yellow" />
        <span className="flex-1 bg-accent-blue" />
        <span className="flex-1 bg-accent-red" />
      </div>

      {/* The map is a visual aid; the legend below is the accessible,
          bilingual representation of the same per-city figures. */}
      <ImpactMapMount points={cities} />

      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-border pt-4 text-sm sm:grid-cols-2">
        {cities.map((city) => (
          <li
            key={city.key}
            className="flex items-baseline justify-between gap-3"
          >
            <span className="flex items-center gap-2 text-body">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 shrink-0 rounded-full bg-accent-blue"
              />
              {city.label}
            </span>
            <span className="tabular-nums text-muted">
              {city.count}{" "}
              <LocalizedText
                es={city.count === 1 ? "entrega" : "entregas"}
                en={city.count === 1 ? "distribution" : "distributions"}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
