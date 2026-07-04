export type MoneyIn = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  amountUsd: number;
  /** Public display name; absent renders as Anonymous. Never a real name column. */
  displayName?: string;
  method?: string;
  through?: string;
};

export type MoneyOut = {
  /** ISO date, YYYY-MM-DD */
  date: string;
  amountUsd: number;
  category?: string;
  descriptionEs: string;
  descriptionEn?: string;
  city?: string;
  /** Drive file ids, already extracted from pasted share links. */
  receiptFileIds: string[];
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
