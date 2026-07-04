"use client";

import { useLanguage, useT } from "@/lib/i18n/language-context";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { formatUsd } from "@/lib/format";
import type { Totals } from "@/lib/totals";

export function TotalsSummary({ totals }: { totals: Totals }) {
  const { lang } = useLanguage();
  const t = useT();

  const items = [
    { label: t("totals.raised"), value: totals.raisedUsd, accent: "bg-accent-yellow" },
    {
      label: t("totals.distributed"),
      value: totals.distributedUsd,
      accent: "bg-accent-blue",
    },
    {
      label: t("totals.available"),
      value: totals.availableUsd,
      accent: "bg-accent-red",
    },
  ];

  return (
    <div>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-border bg-card p-5"
          >
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`inline-block h-1.5 w-1.5 rounded-full ${item.accent}`}
              />
              <dt className="text-sm text-muted">{item.label}</dt>
            </div>
            <dd className="mt-2 font-display text-3xl tabular-nums tracking-tight">
              {formatUsd(item.value, lang)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-muted">
        <LocalizedText
          es="Calculado directamente de los registros publicados."
          en="Computed directly from the published records."
        />
      </p>
    </div>
  );
}
