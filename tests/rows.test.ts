import { describe, expect, it } from "vitest";
import {
  normalizeMoneyInRows,
  normalizeMoneyOutRows,
  sortByDateDesc,
} from "@/lib/sheets/rows";
import {
  MONEY_IN_FIXTURE,
  MONEY_OUT_FIXTURE,
} from "@/lib/sheets/fixtures";

describe("normalizeMoneyInRows over the fixture", () => {
  const { rows, skipped } = normalizeMoneyInRows(MONEY_IN_FIXTURE, "Money In");

  it("publishes only Ready rows with valid date and amount", () => {
    // Fixture: 5 valid ready rows, 1 not ready, 2 ready-but-broken.
    expect(rows).toHaveLength(5);
    expect(skipped).toHaveLength(2);
  });

  it("keeps optional fields absent, not empty", () => {
    const anonymous = rows.find((row) => row.amountUsd === 100);
    expect(anonymous).toBeDefined();
    expect(anonymous?.displayName).toBeUndefined();
  });

  it("normalizes formatted amounts", () => {
    expect(rows.map((row) => row.amountUsd)).toContain(1500);
  });
});

describe("normalizeMoneyOutRows over the fixture", () => {
  const { rows, skipped } = normalizeMoneyOutRows(
    MONEY_OUT_FIXTURE,
    "Money Out",
  );

  it("publishes only Ready rows with date, amount, and Description ES", () => {
    // Fixture: 4 valid ready rows, 1 not ready, 2 ready-but-broken.
    expect(rows).toHaveLength(4);
    expect(skipped).toHaveLength(2);
  });

  it("extracts receipt file ids from pasted share links", () => {
    const water = rows.find((row) => row.amountUsd === 312.4);
    expect(water?.receiptFileIds).toHaveLength(2);
  });

  it("omits optional fields on the minimal row", () => {
    const minimal = rows.find((row) => row.amountUsd === 95.75);
    expect(minimal).toBeDefined();
    expect(minimal?.category).toBeUndefined();
    expect(minimal?.city).toBeUndefined();
    expect(minimal?.receiptFileIds).toEqual([]);
    expect(minimal?.publicLink).toBeUndefined();
    expect(minimal?.purchaser).toBeUndefined();
  });

  it("reports why Ready rows were skipped", () => {
    const reasons = skipped.map((row) => row.reason).join(" ");
    expect(reasons).toContain("Description ES");
    expect(reasons).toContain("amount");
  });
});

describe("edge cases", () => {
  it("handles an empty tab without crashing", () => {
    const { rows, skipped } = normalizeMoneyInRows([], "Money In");
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });

  it("fails closed when the Ready column is missing", () => {
    const values = [
      ["Date", "Amount"],
      ["6/28/2026", "$100"],
    ];
    const { rows } = normalizeMoneyInRows(values, "Money In");
    expect(rows).toEqual([]);
  });

  it("sorts newest first", () => {
    const sorted = sortByDateDesc([
      { date: "2026-06-28" },
      { date: "2026-07-01" },
      { date: "2026-06-30" },
    ]);
    expect(sorted.map((row) => row.date)).toEqual([
      "2026-07-01",
      "2026-06-30",
      "2026-06-28",
    ]);
  });
});
