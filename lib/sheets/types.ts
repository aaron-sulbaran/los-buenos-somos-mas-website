export type MoneyIn = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  amountUsd: number;
  /** Public display name; absent renders as Anonymous. Never a real name column. */
  displayName?: string;
  method?: string;
  through?: string;
};

/** One photo attached to a distribution, with its maintainer-assigned label. */
export type MediaItem = {
  /** Drive file id, already extracted from the pasted share link. */
  fileId: string;
  /** Label typed before the link in the sheet cell; absent shows the generic receipt label. */
  label?: string;
};

export type MoneyOut = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  amountUsd: number;
  category?: string;
  descriptionEs: string;
  descriptionEn?: string;
  city?: string;
  /** Labeled photos, one per line in the sheet cell, any count. */
  media: MediaItem[];
  /** A photo labeled "Publicación" becomes the public-link preview thumbnail. */
  publicationPreviewFileId?: string;
  publicLink?: string;
  purchaser?: string;
};

/** A row that was excluded, with the reason; used for server-side logging only. */
export type SkippedRow = {
  tab: string;
  /** 1-based row number in the sheet, counting the header as row 1. */
  rowNumber: number;
  reason: string;
};

export type LedgerData = {
  moneyIn: MoneyIn[];
  moneyOut: MoneyOut[];
  skipped: SkippedRow[];
};
