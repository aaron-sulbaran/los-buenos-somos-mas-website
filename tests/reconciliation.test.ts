import { describe, expect, it } from "vitest";
import { normalizeMoneyInRows, normalizeMoneyOutRows } from "@/lib/sheets/rows";
import { reconcileTotals } from "@/lib/totals";

/**
 * Reconciliation invariant, per AGENTS.md ("Data layer rules"):
 * "Headline totals (Raised, Distributed, Available) are recomputed from
 * valid published rows so the page always reconciles with the receipts
 * shown." These tests generate raw sheet-shaped datasets that deliberately
 * mix valid, invalid, and not-ready rows, and assert reconcileTotals sums
 * ONLY the rows normalizeMoneyInRows/normalizeMoneyOutRows publish, never
 * the raw sheet totals (which would include skipped or unpublished rows).
 */

const MONEY_IN_HEADER = [
  "Date",
  "Amount",
  "Through",
  "Method",
  "Display Name",
  "Ready",
];

const MONEY_OUT_HEADER = [
  "Date",
  "Amount",
  "Category",
  "Description ES",
  "Description EN",
  "City",
  "Receipt Links",
  "Public Link",
  "Purchaser",
  "Ready",
];

function moneyInRow(date: string, amount: string, ready = "TRUE"): string[] {
  return [date, amount, "Barbs", "Zelle", "", ready];
}

function moneyOutRow(
  date: string,
  amount: string,
  descriptionEs: string,
  ready = "TRUE",
): string[] {
  return [date, amount, "Categoria", descriptionEs, "", "", "", "", "", ready];
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Naive raw-sheet sum: parses every data row's amount cell regardless of
 * validity (unparsable cells count as 0). Used as a contrast to prove the
 * reconciled totals are NOT simply the raw sheet sum. */
function rawSheetSum(dataRows: string[][], amountIndex: number): number {
  return round2(
    dataRows.reduce((sum, row) => {
      const cleaned = (row[amountIndex] ?? "").replace(/[$,\s]/g, "");
      const n = Number(cleaned);
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0),
  );
}

type Dataset = {
  name: string;
  moneyIn: string[][];
  moneyOut: string[][];
};

const datasets: Dataset[] = [
  {
    name: "mix of valid, invalid-amount, invalid-date, and not-ready rows",
    moneyIn: [
      MONEY_IN_HEADER,
      moneyInRow("6/26/2026", "$0.10"),
      moneyInRow("6/26/2026", "$0.20"),
      moneyInRow("6/27/2026", "$500.00", "FALSE"), // not ready
      moneyInRow("", "$50.00"), // missing date, skipped
      moneyInRow("6/28/2026", "$0"), // zero amount, skipped
      moneyInRow("6/28/2026", "-$25.00"), // negative, skipped
    ],
    moneyOut: [
      MONEY_OUT_HEADER,
      moneyOutRow("6/28/2026", "$0.30", "Compra de agua."),
      moneyOutRow("6/29/2026", "$100.00", ""), // missing Description ES, skipped
      moneyOutRow("6/30/2026", "$50.00", "Compra de comida.", "FALSE"), // not ready
    ],
  },
  {
    name: "floating-point-prone cent amounts across many published rows",
    moneyIn: [
      MONEY_IN_HEADER,
      ...Array.from({ length: 10 }, () => moneyInRow("6/26/2026", "$0.10")),
      moneyInRow("6/27/2026", "$999.99", "FALSE"), // not ready, must be excluded
    ],
    moneyOut: [
      MONEY_OUT_HEADER,
      ...Array.from({ length: 7 }, () =>
        moneyOutRow("6/28/2026", "$0.30", "Compra de agua."),
      ),
      moneyOutRow("6/29/2026", "-$5.00", "Fila invalida."), // negative, skipped
    ],
  },
  {
    name: "only invalid and not-ready rows (published totals should be zero)",
    moneyIn: [
      MONEY_IN_HEADER,
      moneyInRow("6/26/2026", "$250.00", "FALSE"),
      moneyInRow("", "$10.00"),
      moneyInRow("6/27/2026", "$0"),
    ],
    moneyOut: [
      MONEY_OUT_HEADER,
      moneyOutRow("6/28/2026", "$80.00", "", "TRUE"), // missing Description ES
      moneyOutRow("6/29/2026", "$60.00", "Valida pero no lista.", "FALSE"),
    ],
  },
  {
    name: "raised and distributed that do not divide evenly to the cent",
    moneyIn: [
      MONEY_IN_HEADER,
      moneyInRow("6/26/2026", "$33.33"),
      moneyInRow("6/26/2026", "$33.33"),
      moneyInRow("6/26/2026", "$33.34"),
    ],
    moneyOut: [
      MONEY_OUT_HEADER,
      moneyOutRow("6/27/2026", "$29.97", "Suministros varios."),
      moneyOutRow("6/28/2026", "$0.03", "Bolsas."),
    ],
  },
];

describe("reconcileTotals sums only published rows", () => {
  datasets.forEach(({ name, moneyIn, moneyOut }) => {
    it(name, () => {
      const inResult = normalizeMoneyInRows(moneyIn, "Money In");
      const outResult = normalizeMoneyOutRows(moneyOut, "Money Out");

      const totals = reconcileTotals(inResult.rows, outResult.rows);

      const expectedRaised = round2(
        inResult.rows.reduce((sum, row) => sum + row.amountUsd, 0),
      );
      const expectedDistributed = round2(
        outResult.rows.reduce((sum, row) => sum + row.amountUsd, 0),
      );

      expect(totals.raisedUsd).toBe(expectedRaised);
      expect(totals.distributedUsd).toBe(expectedDistributed);
      expect(totals.availableUsd).toBe(
        round2(expectedRaised - expectedDistributed),
      );

      // Prove the totals are NOT the raw sheet sum: the raw sum includes
      // amounts from skipped and not-ready rows that must be excluded.
      const rawIn = rawSheetSum(moneyIn.slice(1), 1);
      const rawOut = rawSheetSum(moneyOut.slice(1), 1);
      const anyExcludedIn =
        inResult.skipped.length > 0 || inResult.rows.length < moneyIn.length - 1;
      const anyExcludedOut =
        outResult.skipped.length > 0 ||
        outResult.rows.length < moneyOut.length - 1;

      if (anyExcludedIn) expect(totals.raisedUsd).not.toBe(rawIn);
      if (anyExcludedOut) expect(totals.distributedUsd).not.toBe(rawOut);
    });
  });

  it("availableUsd is raised minus distributed to the cent, no float drift", () => {
    // 10 x $0.10 is the classic float-drift trap (0.1 repeated in binary
    // floating point). Confirm the published sum lands exactly on $1.00,
    // not something like 0.9999999999999999.
    const moneyIn = [
      MONEY_IN_HEADER,
      ...Array.from({ length: 10 }, () => moneyInRow("6/26/2026", "$0.10")),
    ];
    const moneyOut = [
      MONEY_OUT_HEADER,
      moneyOutRow("6/27/2026", "$0.33", "Item uno."),
      moneyOutRow("6/27/2026", "$0.33", "Item dos."),
      moneyOutRow("6/27/2026", "$0.34", "Item tres."),
    ];

    const inResult = normalizeMoneyInRows(moneyIn, "Money In");
    const outResult = normalizeMoneyOutRows(moneyOut, "Money Out");
    const totals = reconcileTotals(inResult.rows, outResult.rows);

    expect(totals.raisedUsd).toBe(1.0);
    expect(totals.distributedUsd).toBe(1.0);
    expect(totals.availableUsd).toBe(0);
  });

  it("handles a dataset with zero published rows on both sides", () => {
    const moneyIn = [MONEY_IN_HEADER, moneyInRow("6/26/2026", "$5.00", "FALSE")];
    const moneyOut = [
      MONEY_OUT_HEADER,
      moneyOutRow("6/27/2026", "$5.00", "", "TRUE"),
    ];

    const inResult = normalizeMoneyInRows(moneyIn, "Money In");
    const outResult = normalizeMoneyOutRows(moneyOut, "Money Out");
    const totals = reconcileTotals(inResult.rows, outResult.rows);

    expect(totals).toEqual({
      raisedUsd: 0,
      distributedUsd: 0,
      availableUsd: 0,
    });
  });
});
