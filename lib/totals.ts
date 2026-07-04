import type { MoneyIn, MoneyOut } from "./sheets/types";

export type Totals = {
  raisedUsd: number;
  distributedUsd: number;
  availableUsd: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Headline totals are always recomputed from the published, valid rows,
 * never read from a maintainer dashboard tab, so the numbers on screen
 * reconcile with the receipts on screen by construction.
 */
export function reconcileTotals(
  moneyIn: MoneyIn[],
  moneyOut: MoneyOut[],
): Totals {
  const raisedUsd = round2(
    moneyIn.reduce((sum, row) => sum + row.amountUsd, 0),
  );
  const distributedUsd = round2(
    moneyOut.reduce((sum, row) => sum + row.amountUsd, 0),
  );
  return {
    raisedUsd,
    distributedUsd,
    availableUsd: round2(raisedUsd - distributedUsd),
  };
}
