import "server-only";
import { getEnv } from "@/lib/env";
import { fetchTabValues } from "./client";
import { MONEY_IN_FIXTURE, MONEY_OUT_FIXTURE } from "./fixtures";
import {
  normalizeMoneyInRows,
  normalizeMoneyOutRows,
  sortByDateDesc,
} from "./rows";
import type { LedgerData } from "./types";

export const MONEY_IN_TAB = "Money In";
export const MONEY_OUT_TAB = "Money Out";

/**
 * Single entry point for all financial data. Fetches both website-facing
 * tabs (or fixtures), applies the Ready-plus-valid gate, and returns
 * published rows sorted newest first.
 */
export async function getLedgerData(): Promise<{
  data: LedgerData | null;
  error: string | null;
}> {
  const env = getEnv();

  let moneyInValues: string[][];
  let moneyOutValues: string[][];

  if (env.DATA_SOURCE === "fixture") {
    moneyInValues = MONEY_IN_FIXTURE;
    moneyOutValues = MONEY_OUT_FIXTURE;
  } else {
    const [moneyInResult, moneyOutResult] = await Promise.all([
      fetchTabValues(MONEY_IN_TAB),
      fetchTabValues(MONEY_OUT_TAB),
    ]);
    if (moneyInResult.error !== null || moneyInResult.data === null) {
      return { data: null, error: moneyInResult.error ?? "no data" };
    }
    if (moneyOutResult.error !== null || moneyOutResult.data === null) {
      return { data: null, error: moneyOutResult.error ?? "no data" };
    }
    moneyInValues = moneyInResult.data;
    moneyOutValues = moneyOutResult.data;
  }

  const moneyIn = normalizeMoneyInRows(moneyInValues, MONEY_IN_TAB);
  const moneyOut = normalizeMoneyOutRows(moneyOutValues, MONEY_OUT_TAB);

  const skipped = [...moneyIn.skipped, ...moneyOut.skipped];
  if (skipped.length > 0) {
    // Server-side visibility for the maintainer workflow; never rendered.
    console.warn(
      `[sheets] skipped ${skipped.length} Ready row(s) that failed validation:`,
      skipped
        .map((row) => `${row.tab} row ${row.rowNumber}: ${row.reason}`)
        .join(" | "),
    );
  }

  return {
    data: {
      moneyIn: sortByDateDesc(moneyIn.rows),
      moneyOut: sortByDateDesc(moneyOut.rows),
      skipped,
    },
    error: null,
  };
}
