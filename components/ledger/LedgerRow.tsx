"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import { formatDate, formatUsd } from "@/lib/format";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { pickLocalized } from "@/lib/i18n/fallback";
import type { MoneyOut } from "@/lib/sheets/types";
import { ReceiptLightbox } from "./ReceiptLightbox";

function receiptSrc(fileId: string): string {
  return `/api/drive-image?id=${encodeURIComponent(fileId)}`;
}

export function LedgerRow({ row }: { row: MoneyOut }) {
  const { lang } = useLanguage();
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const panelId = useId();

  const description = pickLocalized(lang, row.descriptionEs, row.descriptionEn);
  const category = row.category ?? t("common.uncategorized");
  const hasReceipts = row.media.length > 0;

  const thumbAlt = lang === "es" ? "Recibo del fondo" : "Fund receipt";
  const openReceiptLabel = lang === "es" ? "Ver recibo" : "View receipt";

  return (
    <li className="border-b border-border last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="group flex w-full items-start justify-between gap-3 py-4 text-left transition-colors hover:bg-background/60"
      >
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <time
              dateTime={row.date}
              className="text-xs tabular-nums text-muted"
            >
              {formatDate(row.date, lang)}
            </time>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-muted">
              <span
                aria-hidden="true"
                className="inline-block h-1.5 w-1.5 rounded-full bg-accent-blue"
              />
              {category}
            </span>
          </span>
          <span className="mt-1.5 block truncate pr-2 text-body">
            {description}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span className="font-display text-lg tabular-nums tracking-tight">
            {formatUsd(row.amountUsd, lang)}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className={`h-4 w-4 text-muted transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="panel"
            id={panelId}
            role="region"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-5">
              <p className="max-w-2xl text-body">{description}</p>

              {hasReceipts ? (
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                    <LocalizedText es="Recibos" en="Receipts" />
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {row.media.map(({ fileId }, index) => (
                      <li key={fileId}>
                        <button
                          type="button"
                          onClick={() => setLightboxIndex(index)}
                          aria-label={`${openReceiptLabel} ${index + 1}`}
                          className="block overflow-hidden rounded border border-border bg-card transition-opacity hover:opacity-90"
                        >
                          <img
                            src={receiptSrc(fileId)}
                            alt={thumbAlt}
                            loading="lazy"
                            className="h-24 w-20 object-cover"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {row.city || row.purchaser || row.publicLink ? (
                <div className="flex flex-wrap items-center gap-2">
                  {row.city ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
                      <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 rounded-full bg-accent-yellow"
                      />
                      {row.city}
                    </span>
                  ) : null}

                  {row.purchaser ? (
                    <span className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted">
                      <LocalizedText es="Gestionado por" en="Handled by" />{" "}
                      {row.purchaser}
                    </span>
                  ) : null}

                  {row.publicLink ? (
                    <a
                      href={row.publicLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border-b border-foreground pb-0.5 text-xs text-foreground transition-opacity hover:opacity-70"
                    >
                      <LocalizedText
                        es="Ver publicación pública"
                        en="View public post"
                      />
                      <span aria-hidden="true">&#8599;</span>
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {hasReceipts ? (
        <ReceiptLightbox
          fileIds={row.media.map((item) => item.fileId)}
          openIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </li>
  );
}
