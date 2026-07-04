"use client";

import { useLanguage, useT } from "@/lib/i18n/language-context";
import type { Lang } from "@/lib/i18n/dictionary";

const OPTIONS: { value: Lang; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const t = useT();

  return (
    <div
      role="group"
      aria-label={t("nav.languageLabel")}
      className="flex items-center gap-1 rounded-full border border-border p-0.5"
    >
      {OPTIONS.map((option) => {
        const active = lang === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setLang(option.value)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium tracking-wide transition-colors ${
              active
                ? "bg-foreground text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
