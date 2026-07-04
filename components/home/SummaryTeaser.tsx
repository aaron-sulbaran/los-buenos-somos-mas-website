"use client";

import Link from "next/link";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import { formatUsd } from "@/lib/format";
import type { Totals } from "@/lib/totals";
import { LocalizedText } from "@/components/i18n/LocalizedText";

/**
 * Home teaser for the full accounting. Totals are reconciled server-side from
 * the published rows and passed in; this renders them as a ledger strip, not a
 * grid of metric cards, and links out to the record itself. When the records
 * cannot be read, it says so plainly rather than showing a hollow frame.
 */
export function SummaryTeaser({ totals }: { totals: Totals | null }) {
  const { lang } = useLanguage();
  const t = useT();

  const rows =
    totals === null
      ? []
      : [
          { label: t("totals.raised"), value: totals.raisedUsd },
          { label: t("totals.distributed"), value: totals.distributedUsd },
          { label: t("totals.available"), value: totals.availableUsd },
        ];

  return (
    <section className="border-t border-border px-6 py-16 sm:px-10 sm:py-20 min-[860px]:px-14">
      <div className="mx-auto max-w-5xl">
        <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.4rem)] font-normal tracking-[-0.015em]">
          <LocalizedText es="Las cuentas claras" en="The accounting, in the open" />
        </h2>
        <p className="mt-3 max-w-[52ch] text-body">
          <LocalizedText
            es="Recaudado, distribuido y disponible, calculado directamente de los recibos publicados."
            en="Raised, distributed, and available, computed straight from the published receipts."
          />
        </p>

        {totals === null ? (
          <p className="mt-8 max-w-[52ch] text-muted">
            <LocalizedText
              es="Los registros financieros no están disponibles por el momento. El registro completo sigue en la página de transparencia."
              en="The financial records are unavailable right now. The full record still lives on the transparency page."
            />
          </p>
        ) : (
          <dl className="mt-8 grid grid-cols-1 overflow-hidden rounded-lg border border-border sm:grid-cols-3">
            {rows.map((row, index) => (
              <div
                key={row.label}
                className={
                  "px-6 py-7" +
                  (index > 0
                    ? " border-t border-border sm:border-t-0 sm:border-l"
                    : "")
                }
              >
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                  {row.label}
                </dt>
                <dd className="mt-2 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-none tabular-nums tracking-[-0.01em]">
                  {formatUsd(row.value, lang)}
                </dd>
              </div>
            ))}
          </dl>
        )}

        <Link
          href="/transparency"
          className="group mt-8 inline-flex items-center gap-1.5 border-b border-foreground pb-0.5 font-display text-[1.0625rem] transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
        >
          <LocalizedText
            es="Ver el registro completo"
            en="See the full record"
          />
          <span
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
