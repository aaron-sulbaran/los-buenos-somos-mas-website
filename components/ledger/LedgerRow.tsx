"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLanguage, useT } from "@/lib/i18n/language-context";
import { formatDate, formatUsd } from "@/lib/format";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import { pickLocalized } from "@/lib/i18n/fallback";
import type { MoneyOutWithPreview } from "@/lib/og";
import { ReceiptLightbox } from "./ReceiptLightbox";

function receiptSrc(fileId: string): string {
  return `/api/drive-image?id=${encodeURIComponent(fileId)}`;
}

/**
 * The publication card that replaces the old text link. It links out to the
 * organizer's public post and resolves its image in priority order: the
 * maintainer's Publicación screenshot, then the scraped og:image (which can
 * expire, so it falls back on error), then the designed logo panel. The
 * outbound arrow shows in every tier so the card always reads as a link out.
 */
function PublicationCard({
  href,
  previewFileId,
  previewImageUrl,
}: {
  href: string;
  previewFileId?: string;
  previewImageUrl?: string;
}) {
  const { lang } = useLanguage();
  const [scrapedFailed, setScrapedFailed] = useState(false);

  const usingScraped =
    previewFileId === undefined &&
    previewImageUrl !== undefined &&
    !scrapedFailed;

  const imageSrc = previewFileId
    ? receiptSrc(previewFileId)
    : usingScraped
      ? previewImageUrl
      : null;

  const openLabel = lang === "es" ? "Ver la publicación" : "View the post";
  const previewAlt =
    lang === "es" ? "Vista previa de la publicación" : "Post preview";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      <div className="relative aspect-square w-full bg-card">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={previewAlt}
            loading="lazy"
            onError={usingScraped ? () => setScrapedFailed(true) : undefined}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <img
              src="/images/instagram/instagram-logo.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 opacity-70"
            />
            <span className="text-[11px] uppercase tracking-wide text-muted">
              {openLabel}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-3 py-2">
        <span className="truncate text-[11px] uppercase tracking-wide text-muted">
          {openLabel}
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        >
          &#8599;
        </span>
      </div>
    </a>
  );
}

export function LedgerRow({ row }: { row: MoneyOutWithPreview }) {
  const { lang } = useLanguage();
  const t = useT();
  const reduceMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const panelId = useId();

  const description = pickLocalized(lang, row.descriptionEs, row.descriptionEn);
  const category = row.category ?? t("common.uncategorized");
  const hasMedia = row.media.length > 0;
  const hasPublication = Boolean(row.publicLink);

  const thumbAlt = lang === "es" ? "Recibo del fondo" : "Fund receipt";
  const openReceiptLabel = lang === "es" ? "Ver recibo" : "View receipt";

  // A bare row (no photos, no publication, no chips) has nothing to
  // reveal: it renders as a static row with the full description and no
  // expand control.
  const hasDetails =
    hasMedia || hasPublication || Boolean(row.city) || Boolean(row.purchaser);
  const showFullDescription = expanded || !hasDetails;

  const rowHeader = (
    <>
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
        {/* Single copy of the description: truncated while collapsed,
            full text when expanded or when the row is static. */}
        <span
          className={`mt-1.5 block pr-2 text-body ${
            showFullDescription ? "" : "truncate"
          }`}
        >
          {description}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="font-display text-lg tabular-nums tracking-tight">
          {formatUsd(row.amountUsd, lang)}
        </span>
        {hasDetails ? (
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
        ) : null}
      </span>
    </>
  );

  return (
    <li className="border-b border-border last:border-b-0">
      {hasDetails ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="group flex w-full items-start justify-between gap-3 py-4 text-left transition-colors hover:bg-background/60"
        >
          {rowHeader}
        </button>
      ) : (
        <div className="flex w-full items-start justify-between gap-3 py-4 text-left">
          {rowHeader}
        </div>
      )}

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
            <div className="space-y-5 pb-5">
              {hasMedia || hasPublication ? (
                <div className="flex flex-col gap-6 min-[720px]:flex-row min-[720px]:items-start">
                  {hasMedia ? (
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                        <LocalizedText es="Recibos" en="Receipts" />
                      </p>
                      <ul className="grid gap-x-3 gap-y-4 [grid-template-columns:repeat(auto-fill,5rem)]">
                        {row.media.map((item, index) => (
                          <li key={item.fileId}>
                            <button
                              type="button"
                              onClick={() => setLightboxIndex(index)}
                              aria-label={`${openReceiptLabel} ${index + 1}`}
                              className="block w-20 text-left"
                            >
                              <span className="block overflow-hidden rounded border border-border bg-card transition-opacity hover:opacity-90">
                                <img
                                  src={receiptSrc(item.fileId)}
                                  alt={thumbAlt}
                                  loading="lazy"
                                  className="h-24 w-full object-cover"
                                />
                              </span>
                              <span className="mt-1.5 line-clamp-2 block text-[11px] uppercase leading-snug tracking-wide text-muted">
                                {item.label ? (
                                  item.label
                                ) : (
                                  <LocalizedText es="Recibo" en="Receipt" />
                                )}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {hasPublication && row.publicLink ? (
                    <div className="w-full max-w-[15rem] shrink-0 min-[720px]:w-60">
                      <p className="mb-2 text-xs uppercase tracking-wide text-muted">
                        <LocalizedText es="Publicación" en="Publication" />
                      </p>
                      <PublicationCard
                        href={row.publicLink}
                        previewFileId={row.publicationPreviewFileId}
                        previewImageUrl={row.previewImageUrl}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}

              {row.city || row.purchaser ? (
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
                </div>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {hasMedia ? (
        <ReceiptLightbox
          items={row.media}
          openIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </li>
  );
}
