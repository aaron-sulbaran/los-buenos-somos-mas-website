"use client";

import type { MoneyIn } from "@/lib/sheets/types";

/**
 * Phase 1 stub: the interface contract for the Money In workstream.
 * Replaced by the full aggregate-plus-anonymized-list component.
 */
export function MoneyInList({ rows }: { rows: MoneyIn[] }) {
  return (
    <p className="text-sm text-muted tabular-nums">{rows.length}</p>
  );
}
