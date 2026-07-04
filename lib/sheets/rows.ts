import { z } from "zod";
import type { MoneyIn, MoneyOut, SkippedRow } from "./types";
import {
  cleanOptional,
  parseAmountUsd,
  parseDateLenient,
  parseLabeledMedia,
  parsePublicLink,
  parseReady,
} from "./normalize";

/**
 * The resilience contract. Rows are normalized leniently, then validated
 * strictly with Zod. Only rows that are Ready AND valid are published.
 * Hard-required failures skip the row; missing optionals simply omit.
 * Not-ready rows are unpublished by design and are not reported.
 */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const optionalText = z.string().min(1).optional();

export const moneyInSchema = z.object({
  date: isoDate,
  amountUsd: z.number().positive(),
  displayName: optionalText,
  method: optionalText,
  through: optionalText,
});

export const moneyOutSchema = z.object({
  date: isoDate,
  amountUsd: z.number().positive(),
  category: optionalText,
  descriptionEs: z.string().min(1),
  descriptionEn: optionalText,
  city: optionalText,
  media: z.array(
    z.object({
      fileId: z.string().min(10),
      label: z.string().min(1).optional(),
    }),
  ),
  publicationPreviewFileId: z.string().min(10).optional(),
  publicLink: z.url().optional(),
  purchaser: optionalText,
});

type HeaderMap = Map<string, number>;

function buildHeaderMap(headerRow: string[]): HeaderMap {
  const map: HeaderMap = new Map();
  headerRow.forEach((cell, index) => {
    const key = cell.trim().toLowerCase();
    if (key !== "" && !map.has(key)) map.set(key, index);
  });
  return map;
}

function cellAt(
  row: string[],
  header: HeaderMap,
  column: string,
): string | undefined {
  const index = header.get(column);
  if (index === undefined) return undefined;
  return row[index];
}

export function normalizeMoneyInRows(
  values: string[][],
  tab: string,
): { rows: MoneyIn[]; skipped: SkippedRow[] } {
  const rows: MoneyIn[] = [];
  const skipped: SkippedRow[] = [];
  if (values.length === 0) {
    skipped.push({ tab, rowNumber: 1, reason: "missing header row" });
    return { rows, skipped };
  }

  const header = buildHeaderMap(values[0]);
  values.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    if (!parseReady(cellAt(row, header, "ready"))) return;

    const candidate = {
      date: parseDateLenient(cellAt(row, header, "date")),
      amountUsd: parseAmountUsd(cellAt(row, header, "amount")),
      displayName: cleanOptional(cellAt(row, header, "display name")),
      method: cleanOptional(cellAt(row, header, "method")),
      through: cleanOptional(cellAt(row, header, "through")),
    };

    const parsed = moneyInSchema.safeParse(candidate);
    if (parsed.success) {
      rows.push(parsed.data);
    } else {
      skipped.push({
        tab,
        rowNumber,
        reason: describeFailure(candidate.date, candidate.amountUsd, null),
      });
    }
  });

  return { rows, skipped };
}

export function normalizeMoneyOutRows(
  values: string[][],
  tab: string,
): { rows: MoneyOut[]; skipped: SkippedRow[] } {
  const rows: MoneyOut[] = [];
  const skipped: SkippedRow[] = [];
  if (values.length === 0) {
    skipped.push({ tab, rowNumber: 1, reason: "missing header row" });
    return { rows, skipped };
  }

  const header = buildHeaderMap(values[0]);
  values.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    if (!parseReady(cellAt(row, header, "ready"))) return;

    const descriptionEs = cleanOptional(cellAt(row, header, "description es"));
    const parsedMedia = parseLabeledMedia(cellAt(row, header, "receipt links"));
    const candidate = {
      date: parseDateLenient(cellAt(row, header, "date")),
      amountUsd: parseAmountUsd(cellAt(row, header, "amount")),
      category: cleanOptional(cellAt(row, header, "category")),
      descriptionEs: descriptionEs ?? "",
      descriptionEn: cleanOptional(cellAt(row, header, "description en")),
      city: cleanOptional(cellAt(row, header, "city")),
      media: parsedMedia.media,
      publicationPreviewFileId: parsedMedia.publicationPreviewFileId,
      publicLink: parsePublicLink(cellAt(row, header, "public link")),
      purchaser: cleanOptional(cellAt(row, header, "purchaser")),
    };

    const parsed = moneyOutSchema.safeParse(candidate);
    if (parsed.success) {
      rows.push(parsed.data);
    } else {
      skipped.push({
        tab,
        rowNumber,
        reason: describeFailure(
          candidate.date,
          candidate.amountUsd,
          candidate.descriptionEs,
        ),
      });
    }
  });

  return { rows, skipped };
}

function describeFailure(
  date: string | null,
  amount: number | null,
  descriptionEs: string | null,
): string {
  const problems: string[] = [];
  if (!date) problems.push("invalid or missing date");
  if (!amount) problems.push("invalid or missing amount");
  if (descriptionEs !== null && descriptionEs === "") {
    problems.push("missing Description ES");
  }
  return problems.length > 0 ? problems.join(", ") : "failed validation";
}

/** Newest first; stable for equal dates. */
export function sortByDateDesc<T extends { date: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => b.date.localeCompare(a.date));
}
