"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { LocalizedText } from "@/components/i18n/LocalizedText";
import type { MediaItem } from "@/lib/sheets/types";

type ReceiptLightboxProps = {
  items: MediaItem[];
  /** Index to open at, or null when the lightbox is closed. */
  openIndex: number | null;
  onClose: () => void;
};

function receiptSrc(fileId: string): string {
  return `/api/drive-image?id=${encodeURIComponent(fileId)}`;
}

/**
 * Accessible receipt viewer built on the native <dialog>. showModal gives
 * us focus trapping, a backdrop, and Escape-to-close for free, plus focus
 * restoration to the thumbnail that opened it. Prev/next appear only when
 * a row has more than one receipt.
 */
export function ReceiptLightbox({
  items,
  openIndex,
  onClose,
}: ReceiptLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [lastOpenIndex, setLastOpenIndex] = useState<number | null>(null);
  const { lang } = useLanguage();

  const total = items.length;
  const hasMany = total > 1;

  // Adjust state during render when the parent opens the lightbox at a new
  // index; this is React's supported pattern for deriving state from props
  // and avoids a setState inside an effect.
  if (openIndex !== lastOpenIndex) {
    setLastOpenIndex(openIndex);
    if (openIndex !== null) setIndex(openIndex);
  }

  const showPrev = useCallback(() => {
    setIndex((current) => (current - 1 + total) % total);
  }, [total]);

  const showNext = useCallback(() => {
    setIndex((current) => (current + 1) % total);
  }, [total]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (openIndex !== null) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [openIndex]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    if (openIndex === null || !hasMany) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, hasMany, showPrev, showNext]);

  const altText = lang === "es" ? "Recibo del fondo" : "Fund receipt";
  const closeLabel = lang === "es" ? "Cerrar" : "Close";
  const prevLabel = lang === "es" ? "Recibo anterior" : "Previous receipt";
  const nextLabel = lang === "es" ? "Recibo siguiente" : "Next receipt";

  const current = items[index];
  const fileId = current?.fileId;

  return (
    <dialog
      ref={dialogRef}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      className="m-auto max-h-[90dvh] w-[92vw] max-w-3xl bg-transparent p-0 backdrop:bg-foreground/80"
    >
      <div className="relative rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3 pb-3">
          <span className="min-w-0 flex-1 truncate text-xs uppercase tracking-wide text-muted">
            {current?.label ? (
              current.label
            ) : (
              <LocalizedText es="Recibo" en="Receipt" />
            )}
            {hasMany ? (
              <span className="ml-2 tabular-nums normal-case tracking-normal">
                {index + 1} / {total}
              </span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={closeLabel}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs uppercase tracking-wide text-muted transition-colors hover:text-foreground"
          >
            {closeLabel}
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          {fileId ? (
            <img
              src={receiptSrc(fileId)}
              alt={altText}
              className="max-h-[74dvh] w-auto max-w-full rounded border border-border object-contain"
            />
          ) : null}

          {hasMany ? (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label={prevLabel}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/90 px-3 py-2 text-sm text-body transition-colors hover:text-foreground"
              >
                <span aria-hidden="true">&#8592;</span>
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label={nextLabel}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-border bg-background/90 px-3 py-2 text-sm text-body transition-colors hover:text-foreground"
              >
                <span aria-hidden="true">&#8594;</span>
              </button>
            </>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
