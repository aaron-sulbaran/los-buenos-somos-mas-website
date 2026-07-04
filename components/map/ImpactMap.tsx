import type { MoneyOut } from "@/lib/sheets/types";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import {
  MAP_VIEWBOX,
  lookupCityCoord,
  lookupCityLabel,
  normalizeCityName,
  type CityCoord,
} from "@/lib/geo/cities";

type CityPoint = {
  key: string;
  label: string;
  coord: CityCoord;
  count: number;
};

/**
 * Aggregates distributions by known city. Rows with no city, or a city we
 * cannot place, are silently dropped from the map (the ledger still shows
 * them). Privacy: only a city label and a count ever reach the screen.
 */
function collectCities(rows: MoneyOut[]): CityPoint[] {
  const byKey = new Map<string, CityPoint>();
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
      byKey.set(key, { key, label, coord, count: 1 });
    }
  }
  return [...byKey.values()].sort((a, b) => b.count - a.count);
}

/** Dot radius grows gently with the distribution count, then flattens. */
function dotRadius(count: number): number {
  return 5 + Math.min(Math.sqrt(count) * 2.4, 9);
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
    <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
      {/* The dots are a visual aid; the legend below is the accessible,
          bilingual representation of the same data, so the SVG is hidden
          from assistive technology to avoid an untranslated label. */}
      <svg
        viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
        className="h-auto w-full"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* A single hairline hinting at the coastline; not a survey. */}
        <path
          d="M 40 118 C 120 96, 240 92, 372 78"
          fill="none"
          className="stroke-border"
          strokeWidth={1}
        />
        {cities.map((city) => (
          <g key={city.key}>
            <circle
              cx={city.coord.x}
              cy={city.coord.y}
              r={dotRadius(city.count) + 4}
              className="fill-accent-blue"
              opacity={0.12}
            />
            <circle
              cx={city.coord.x}
              cy={city.coord.y}
              r={dotRadius(city.count)}
              className="fill-accent-blue"
              opacity={0.8}
            />
          </g>
        ))}
      </svg>

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
