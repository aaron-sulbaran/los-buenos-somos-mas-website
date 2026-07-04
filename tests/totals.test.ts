import { describe, expect, it } from "vitest";
import { reconcileTotals } from "@/lib/totals";
import type { MoneyIn, MoneyOut } from "@/lib/sheets/types";

const moneyIn: MoneyIn[] = [
  { date: "2026-06-26", amountUsd: 250 },
  { date: "2026-06-27", amountUsd: 0.1 },
  { date: "2026-06-28", amountUsd: 0.2 },
];

const moneyOut: MoneyOut[] = [
  {
    date: "2026-06-29",
    amountUsd: 100.05,
    descriptionEs: "Ejemplo",
    receiptFileIds: [],
  },
];

describe("reconcileTotals", () => {
  it("sums published rows and computes availability", () => {
    const totals = reconcileTotals(moneyIn, moneyOut);
    expect(totals.raisedUsd).toBe(250.3);
    expect(totals.distributedUsd).toBe(100.05);
    expect(totals.availableUsd).toBe(150.25);
  });

  it("avoids floating point drift", () => {
    const totals = reconcileTotals(
      [{ date: "2026-06-26", amountUsd: 0.1 }, { date: "2026-06-26", amountUsd: 0.2 }],
      [],
    );
    expect(totals.raisedUsd).toBe(0.3);
  });

  it("handles empty ledgers", () => {
    const totals = reconcileTotals([], []);
    expect(totals).toEqual({
      raisedUsd: 0,
      distributedUsd: 0,
      availableUsd: 0,
    });
  });
});
