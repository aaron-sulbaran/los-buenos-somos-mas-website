/**
 * Normalization helpers for raw sheet cells. Lenient on input, strict on
 * output: every function returns a clean value or null, never throws.
 */

/** Strips $, commas, and spaces; returns a positive dollar amount or null. */
export function parseAmountUsd(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  const value = Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100) / 100;
}

/**
 * Lenient date parsing to an ISO YYYY-MM-DD string.
 * Accepts ISO (2026-06-28), US-style M/D/YYYY and M/D/YY (the sheet's
 * display format), and falls back to Date.parse for anything else.
 */
export function parseDateLenient(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim();
  if (value === "") return null;

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return toIsoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const us = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (us) {
    let year = Number(us[3]);
    if (year < 100) year += 2000;
    return toIsoDate(year, Number(us[1]), Number(us[2]));
  }

  // Date.parse is dangerously lenient: Spanish month names like "junio",
  // "mayo", or "marzo" collide with English month abbreviations and the
  // year silently defaults to 2001, publishing a corrupted date. Only
  // trust the fallback when the string carries an explicit 4-digit year.
  if (/\b\d{4}\b/.test(value)) {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      const date = new Date(timestamp);
      return toIsoDate(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
      );
    }
  }

  return null;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  const candidate = new Date(Date.UTC(year, month - 1, day));
  if (
    candidate.getUTCFullYear() !== year ||
    candidate.getUTCMonth() !== month - 1 ||
    candidate.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const DRIVE_ID_PATTERN = /^[a-zA-Z0-9_-]{10,100}$/;

/** Extracts a Drive file id from a pasted share link, or null. */
export function extractDriveFileId(link: string): string | null {
  const value = link.trim();
  if (value === "") return null;

  const fileMatch = value.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]{10,100})/);
  if (fileMatch) return fileMatch[1];

  const queryMatch = value.match(/[?&]id=([a-zA-Z0-9_-]{10,100})/);
  if (queryMatch) return queryMatch[1];

  // A bare id pasted without a URL.
  if (!value.includes("/") && DRIVE_ID_PATTERN.test(value) && value.length >= 20) {
    return value;
  }

  return null;
}

/** Splits a receipt cell into deduplicated Drive file ids; invalid links are dropped. */
export function parseReceiptLinks(raw: string | undefined): string[] {
  if (!raw) return [];
  const ids = raw
    .split(/[\s,;]+/)
    .map(extractDriveFileId)
    .filter((id): id is string => id !== null);
  return [...new Set(ids)];
}

const TRUTHY = new Set(["true", "yes", "si", "sí", "x", "✓", "1", "checked"]);

/** Google Sheets checkboxes arrive as the strings TRUE / FALSE. */
export function parseReady(raw: string | undefined): boolean {
  if (!raw) return false;
  return TRUTHY.has(raw.trim().toLowerCase());
}

/** Trims a cell; empty becomes undefined so optional fields cleanly omit. */
export function cleanOptional(raw: string | undefined): string | undefined {
  const value = raw?.trim();
  return value ? value : undefined;
}

/** Accepts only http(s) URLs for the optional public link. */
export function parsePublicLink(raw: string | undefined): string | undefined {
  const value = cleanOptional(raw);
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.href;
  } catch {
    return undefined;
  }
  return undefined;
}
