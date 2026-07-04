"use client";

import { useT } from "@/lib/i18n/language-context";

/** Dignified error state when the Sheet cannot be read. Never breaks layout. */
export function DataUnavailable() {
  const t = useT();
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center text-muted">
      {t("data.unavailable")}
    </div>
  );
}
