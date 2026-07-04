"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/language-context";
import type { DictKey } from "@/lib/i18n/dictionary";
import { LanguageToggle } from "./LanguageToggle";

/**
 * Active-tab underlines follow the flag's color order across the three
 * routes: yellow, blue, red. A quiet motif, never a literal flag.
 */
const LINKS: { href: string; key: DictKey; decoration: string }[] = [
  { href: "/", key: "nav.home", decoration: "decoration-accent-yellow" },
  {
    href: "/transparency",
    key: "nav.transparency",
    decoration: "decoration-accent-blue",
  },
  {
    href: "/support",
    key: "nav.support",
    decoration: "decoration-accent-red",
  },
];

export function SiteNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      {/* Padding matches the hero's so the wordmark sits on the same left
          edge as the page content instead of floating inward. */}
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3 sm:px-10 min-[860px]:px-14">
        <Link
          href="/"
          className="font-display text-lg leading-tight tracking-tight"
        >
          {t("site.name")}
        </Link>
        <div className="flex items-center gap-4 sm:order-last">
          <LanguageToggle />
        </div>
        <nav
          aria-label="Main"
          className="flex w-full items-center gap-5 text-sm sm:ml-auto sm:w-auto"
        >
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`py-1 transition-colors ${
                  active
                    ? `text-foreground underline decoration-2 underline-offset-8 ${link.decoration}`
                    : "text-muted hover:text-foreground"
                }`}
              >
                {t(link.key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
