"use client";

import { useLanguage } from "@/lib/i18n/language-context";
import { formatUsd } from "@/lib/format";

/**
 * Aggregate framing for the Money In section: how many donations were
 * published and their total, in the visitor's language. Kept client-side so
 * the currency formatting tracks the active locale like everything else.
 */
export function MoneyInSummary({
  count,
  totalUsd,
}: {
  count: number;
  totalUsd: number;
}) {
  const { lang } = useLanguage();

  if (count === 0) {
    return (
      <p className="mt-2 max-w-xl text-sm text-muted">
        {lang === "es"
          ? "Todavía no hay donaciones publicadas."
          : "No donations published yet."}
      </p>
    );
  }

  const total = formatUsd(totalUsd, lang);

  return (
    <p className="mt-2 max-w-xl text-sm text-muted">
      {lang === "es"
        ? `${count} ${
            count === 1 ? "donación" : "donaciones"
          } publicadas, ${total} en total. Los donantes son anónimos salvo que hayan elegido mostrar un nombre.`
        : `${count} ${
            count === 1 ? "donation" : "donations"
          } published, ${total} in total. Donors are anonymous unless they chose to show a name.`}
    </p>
  );
}
