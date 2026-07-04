"use client";

import { useLanguage, useT } from "@/lib/i18n/language-context";
import { formatUsd } from "@/lib/format";
import type { Totals } from "@/lib/totals";

export function TotalsSummary({ totals }: { totals: Totals }) {
  const { lang } = useLanguage();
  const t = useT();

  const items = [
    { label: t("totals.raised"), value: totals.raisedUsd },
    { label: t("totals.distributed"), value: totals.distributedUsd },
    { label: t("totals.available"), value: totals.availableUsd },
  ];

  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg border border-border bg-card p-5"
        >
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className="mt-1 font-display text-3xl tabular-nums tracking-tight">
            {formatUsd(item.value, lang)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
