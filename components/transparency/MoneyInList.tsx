"use client";

import { useId, useState } from "react";
import type { MoneyIn } from "@/lib/sheets/types";
import { formatDate, formatUsd } from "@/lib/format";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import { LocalizedText } from "@/components/i18n/LocalizedText";

/**
 * Money in: an aggregate header plus a collapsed-by-default, anonymized
 * list of individual donations. Never renders anything beyond the
 * provided displayName; blank names render as the Anonymous label.
 */
export function MoneyInList({ rows }: { rows: MoneyIn[] }) {
  const { lang } = useLanguage();
  const t = useT();
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  const total = rows.reduce((sum, row) => sum + row.amountUsd, 0);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-muted">
          <LocalizedText
            es={`${rows.length} donaciones`}
            en={`${rows.length} donations`}
          />
        </p>
        <p className="font-display text-2xl tabular-nums tracking-tight">
          {formatUsd(total, lang)}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          <LocalizedText
            es="Aún no hay donaciones publicadas."
            en="No donations have been published yet."
          />
        </p>
      ) : (
        <>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={listId}
            onClick={() => setExpanded((current) => !current)}
            className="mt-4 text-sm text-body underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
          >
            {expanded ? (
              <LocalizedText es="Ocultar la lista" en="Hide the list" />
            ) : (
              <LocalizedText es="Ver la lista" en="View the list" />
            )}
          </button>

          {expanded ? (
            <ul id={listId} className="mt-4 space-y-3">
              {rows.map((row, index) => (
                <li
                  key={`${row.date}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-sm text-muted tabular-nums">
                      {formatDate(row.date, lang)}
                    </span>
                    <span className="text-sm text-foreground">
                      {row.displayName ? row.displayName : t("common.anonymous")}
                    </span>
                    {row.method ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        {row.method}
                      </span>
                    ) : null}
                    {row.through ? (
                      <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
                        {row.through}
                      </span>
                    ) : null}
                  </div>
                  <span className="text-sm tabular-nums text-body">
                    {formatUsd(row.amountUsd, lang)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </section>
  );
}
