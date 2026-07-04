"use client";

import { useMemo, useState } from "react";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import type { MoneyOutWithPreview } from "@/lib/og";
import { LedgerRow } from "./LedgerRow";

/** Combining diacritical marks, stripped after NFD for accent-insensitive search. */
const COMBINING_MARKS = /[\u0300-\u036f]/g;

/** Folds text for case- and accent-insensitive matching. */
function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim();
}

/** Sentinel category key for rows with no category cell. */
const UNCATEGORIZED = "__uncategorized__";

function categoryKey(row: MoneyOutWithPreview): string {
  return row.category ?? UNCATEGORIZED;
}

export function MoneyOutLedger({ rows }: { rows: MoneyOutWithPreview[] }) {
  const { lang } = useLanguage();
  const t = useT();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const row of rows) {
      const key = categoryKey(row);
      if (!seen.has(key)) {
        seen.add(key);
        ordered.push(key);
      }
    }
    return ordered;
  }, [rows]);

  const visibleRows = useMemo(() => {
    const needle = fold(query);
    return rows.filter((row) => {
      if (activeCategory !== null && categoryKey(row) !== activeCategory) {
        return false;
      }
      if (needle === "") return true;
      const haystack = fold(
        [row.descriptionEs, row.descriptionEn ?? "", row.category ?? ""].join(
          " ",
        ),
      );
      return haystack.includes(needle);
    });
  }, [rows, query, activeCategory]);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted">
        <LocalizedText
          es="Todavía no hay entregas publicadas. Aparecerán aquí, con recibos, a medida que se registren."
          en="No distributions published yet. They will appear here, with receipts, as they are recorded."
        />
      </div>
    );
  }

  const categoryLabel = (key: string): string =>
    key === UNCATEGORIZED ? t("common.uncategorized") : key;

  const searchPlaceholder =
    lang === "es"
      ? "Buscar por descripción o categoría"
      : "Search by description or category";
  const searchLabel = lang === "es" ? "Buscar entregas" : "Search distributions";
  const allLabel = lang === "es" ? "Todas" : "All";

  return (
    <div>
      <div className="flex flex-col gap-4">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchLabel}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-body placeholder:text-muted focus:border-foreground focus:outline-none"
        />

        {categories.length > 1 ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory(null)}
              aria-pressed={activeCategory === null}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition-colors ${
                activeCategory === null
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted hover:text-foreground"
              }`}
            >
              {allLabel}
            </button>
            {categories.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                aria-pressed={activeCategory === key}
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition-colors ${
                  activeCategory === key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted hover:text-foreground"
                }`}
              >
                {categoryLabel(key)}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {visibleRows.length === 0 ? (
        <div className="mt-6 rounded-lg border border-border bg-card p-8 text-center text-sm text-muted">
          <LocalizedText
            es="Ninguna entrega coincide con tu búsqueda."
            en="No distributions match your search."
          />
        </div>
      ) : (
        <ul className="mt-4 border-t border-border">
          {visibleRows.map((row, index) => (
            <LedgerRow key={`${row.date}-${index}`} row={row} />
          ))}
        </ul>
      )}
    </div>
  );
}
