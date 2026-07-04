"use client";

import { useT } from "@/lib/i18n/language-context";

export function SiteFooter() {
  const t = useT();

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-muted sm:px-6">
        <p className="font-display text-base text-foreground">
          {t("site.name")}
        </p>
        <p>{t("footer.livingDocument")}</p>
        <p>{t("footer.fundClosed")}</p>
      </div>
    </footer>
  );
}
