"use client";

import { useLanguage, useT } from "@/lib/i18n/language-context";

/**
 * First-visit language prompt. Shows once, until the visitor picks a
 * language here or via the nav toggle; the choice persists locally.
 */
export function LanguagePrompt() {
  const { ready, hasChosen, setLang } = useLanguage();
  const t = useT();

  if (!ready || hasChosen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 sm:items-center"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("prompt.title")}
        className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-lg"
      >
        <h2 className="font-display text-xl">{t("prompt.title")}</h2>
        <p className="mt-2 text-sm text-muted">
          Elige tu idioma. / Choose your language.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            autoFocus
            onClick={() => setLang("es")}
            className="rounded-md border border-border bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("prompt.spanish")}
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            className="rounded-md border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-background"
          >
            {t("prompt.english")}
          </button>
        </div>
      </div>
    </div>
  );
}
