"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/language-context";
import type { DictKey } from "@/lib/i18n/dictionary";
import { LanguageToggle } from "./LanguageToggle";

const LINKS: { href: string; key: DictKey }[] = [
  { href: "/", key: "nav.home" },
  { href: "/transparency", key: "nav.transparency" },
  { href: "/support", key: "nav.support" },
];

export function SiteNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
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
          className="flex w-full items-center gap-5 text-sm sm:w-auto"
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
                    ? "text-foreground underline decoration-accent-yellow decoration-2 underline-offset-8"
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
