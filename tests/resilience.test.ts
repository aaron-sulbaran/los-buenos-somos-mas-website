import { describe, expect, it } from "vitest";
import { normalizeMoneyInRows, normalizeMoneyOutRows } from "@/lib/sheets/rows";

/**
 * Resilience contract, per AGENTS.md ("Data layer rules"):
 * - The site reads dedicated website-facing tabs with a Ready checkbox.
 * - Only rows where Ready = TRUE AND validation passes are published.
 * - Hard-required fields cause a row to be skipped if missing or invalid.
 * - Optional fields, when absent, simply omit their element; the row
 *   still renders cleanly.
 * - The mapper (buildHeaderMap / cellAt in lib/sheets/rows.ts) resolves
 *   columns by header name, not position, so column order must not matter.
 *
 * These tests build inline raw sheet-shaped data (header row + string
 * cells, matching the shape used in lib/sheets/fixtures.ts) to exercise
 * that contract directly, independent of the fixture file.
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

/** Builds a row array by header name, defaulting any omitted column to "". */
function rowFor(header: string[], cells: Record<string, string>): string[] {
  return header.map((column) => cells[column] ?? "");
}

const FULL_MONEY_IN_ROW = {
  Date: "6/28/2026",
  Amount: "$50.00",
  Through: "Barbs",
  Method: "Zelle",
  "Display Name": "M. R.",
  Ready: "TRUE",
};

const FULL_MONEY_OUT_ROW = {
  Date: "6/28/2026",
  Amount: "$100.00",
  Category: "Agua",
  "Description ES": "Compra de agua potable para el refugio.",
  "Description EN": "Purchase of drinking water for the shelter.",
  City: "La Guaira",
  "Receipt Links":
    "https://drive.google.com/file/d/FIXTUREaaaaaaaaaaaaaaaa1/view",
  "Public Link": "https://instagram.com/p/example",
  Purchaser: "Barbs",
  Ready: "TRUE",
};

describe("Money Out: optional fields absent one at a time", () => {
  const optionalColumns: (keyof typeof FULL_MONEY_OUT_ROW)[] = [
    "Category",
    "Description EN",
    "City",
    "Receipt Links",
    "Public Link",
    "Purchaser",
  ];

  optionalColumns.forEach((column) => {
    it(`still publishes when "${column}" is absent`, () => {
      const row = rowFor(MONEY_OUT_HEADER, {
        ...FULL_MONEY_OUT_ROW,
        [column]: "",
      });
      const { rows, skipped } = normalizeMoneyOutRows(
        [MONEY_OUT_HEADER, row],
        "Money Out",
      );
      expect(skipped).toEqual([]);
      expect(rows).toHaveLength(1);

      const published = rows[0];
      if (column === "Category") expect(published.category).toBeUndefined();
      if (column === "Description EN")
        expect(published.descriptionEn).toBeUndefined();
      if (column === "City") expect(published.city).toBeUndefined();
      if (column === "Receipt Links")
        expect(published.media).toEqual([]);
      if (column === "Public Link")
        expect(published.publicLink).toBeUndefined();
      if (column === "Purchaser")
        expect(published.purchaser).toBeUndefined();
    });
  });

  it("still requires Description ES even though the others are optional", () => {
    // Sanity check that the loop above isn't accidentally lenient on
    // Description ES too: hard-required, must remain enforced.
    const row = rowFor(MONEY_OUT_HEADER, {
      ...FULL_MONEY_OUT_ROW,
      "Description ES": "",
    });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });
});

describe("Money In: optional fields absent one at a time", () => {
  const optionalColumns: (keyof typeof FULL_MONEY_IN_ROW)[] = [
    "Display Name",
    "Method",
    "Through",
  ];

  optionalColumns.forEach((column) => {
    it(`still publishes when "${column}" is absent`, () => {
      const row = rowFor(MONEY_IN_HEADER, {
        ...FULL_MONEY_IN_ROW,
        [column]: "",
      });
      const { rows, skipped } = normalizeMoneyInRows(
        [MONEY_IN_HEADER, row],
        "Money In",
      );
      expect(skipped).toEqual([]);
      expect(rows).toHaveLength(1);

      const published = rows[0];
      if (column === "Display Name")
        expect(published.displayName).toBeUndefined();
      if (column === "Method") expect(published.method).toBeUndefined();
      if (column === "Through") expect(published.through).toBeUndefined();
    });
  });
});

describe("hard-required failures are skipped, never published", () => {
  it("Money Out: missing date", () => {
    const row = rowFor(MONEY_OUT_HEADER, { ...FULL_MONEY_OUT_ROW, Date: "" });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("date");
  });

  it("Money Out: zero amount", () => {
    const row = rowFor(MONEY_OUT_HEADER, { ...FULL_MONEY_OUT_ROW, Amount: "$0" });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("amount");
  });

  it("Money Out: negative amount", () => {
    const row = rowFor(MONEY_OUT_HEADER, {
      ...FULL_MONEY_OUT_ROW,
      Amount: "-$25.00",
    });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("amount");
  });

  it("Money Out: whitespace-only Description ES", () => {
    const row = rowFor(MONEY_OUT_HEADER, {
      ...FULL_MONEY_OUT_ROW,
      "Description ES": "    ",
    });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("Description ES");
  });

  it("Money In: missing date", () => {
    const row = rowFor(MONEY_IN_HEADER, { ...FULL_MONEY_IN_ROW, Date: "" });
    const { rows, skipped } = normalizeMoneyInRows(
      [MONEY_IN_HEADER, row],
      "Money In",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });

  it("Money In: zero amount", () => {
    const row = rowFor(MONEY_IN_HEADER, { ...FULL_MONEY_IN_ROW, Amount: "$0" });
    const { rows, skipped } = normalizeMoneyInRows(
      [MONEY_IN_HEADER, row],
      "Money In",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });

  it("Money In: negative amount", () => {
    const row = rowFor(MONEY_IN_HEADER, {
      ...FULL_MONEY_IN_ROW,
      Amount: "-$10.00",
    });
    const { rows, skipped } = normalizeMoneyInRows(
      [MONEY_IN_HEADER, row],
      "Money In",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });

  /**
   * Regression guard for a fixed bug: several Spanish month names share a
   * 3-letter prefix with an English month abbreviation ("junio" -> "jun",
   * "marzo" -> "mar", "mayo" -> "may"), so V8's loose Date.parse used to
   * accept "junio 28" and silently default the year to 2001, publishing a
   * corrupted date. The Date.parse fallback now requires an explicit
   * 4-digit year in the raw string, so this shape is rejected and the row
   * skips per the hard-required-field contract.
   */
  it("Money Out: 'junio 28' (no year) is rejected and the row skips", () => {
    const row = rowFor(MONEY_OUT_HEADER, {
      ...FULL_MONEY_OUT_ROW,
      Date: "junio 28",
    });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("date");
  });

  it("Money Out: '28 de junio' (with 'de') is correctly rejected", () => {
    // Contrast case: this Spanish phrasing does NOT collide with the
    // English month-prefix quirk above and is rejected as expected.
    const row = rowFor(MONEY_OUT_HEADER, {
      ...FULL_MONEY_OUT_ROW,
      Date: "28 de junio",
    });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });
});

describe("Ready is checked but every other cell is empty", () => {
  it("Money Out: skips with all hard-required problems reported", () => {
    const row = rowFor(MONEY_OUT_HEADER, { Ready: "TRUE" });
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, row],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toContain("date");
    expect(skipped[0].reason).toContain("amount");
    expect(skipped[0].reason).toContain("Description ES");
  });

  it("Money In: skips", () => {
    const row = rowFor(MONEY_IN_HEADER, { Ready: "TRUE" });
    const { rows, skipped } = normalizeMoneyInRows(
      [MONEY_IN_HEADER, row],
      "Money In",
    );
    expect(rows).toEqual([]);
    expect(skipped).toHaveLength(1);
  });
});

describe("header columns in a different order than the canonical tabs", () => {
  it("Money Out: mapper resolves by header name, not position", () => {
    const shuffledHeader = [
      "Ready",
      "Purchaser",
      "Public Link",
      "Receipt Links",
      "City",
      "Description EN",
      "Description ES",
      "Amount",
      "Category",
      "Date",
    ];
    const row = rowFor(shuffledHeader, FULL_MONEY_OUT_ROW);
    const { rows, skipped } = normalizeMoneyOutRows(
      [shuffledHeader, row],
      "Money Out",
    );
    expect(skipped).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      date: "2026-06-28",
      amountUsd: 100,
      category: "Agua",
      city: "La Guaira",
      purchaser: "Barbs",
    });
  });

  it("Money In: mapper resolves by header name, not position", () => {
    const shuffledHeader = [
      "Ready",
      "Display Name",
      "Method",
      "Through",
      "Amount",
      "Date",
    ];
    const row = rowFor(shuffledHeader, FULL_MONEY_IN_ROW);
    const { rows, skipped } = normalizeMoneyInRows(
      [shuffledHeader, row],
      "Money In",
    );
    expect(skipped).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      date: "2026-06-28",
      amountUsd: 50,
      through: "Barbs",
      method: "Zelle",
    });
  });
});

describe("duplicate header names", () => {
  it("keeps the first matching column and ignores the duplicate", () => {
    const header = [
      "Date",
      "Amount",
      "Category",
      "Category",
      "Description ES",
      "Ready",
    ];
    const row = [
      "6/28/2026",
      "$50.00",
      "First Category",
      "Second Category",
      "Compra de ejemplo.",
      "TRUE",
    ];
    const { rows, skipped } = normalizeMoneyOutRows([header, row], "Money Out");
    expect(skipped).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0].category).toBe("First Category");
  });
});

describe("completely empty cells arrays", () => {
  it("an empty row ([]) within the sheet is silently ignored, not reported", () => {
    // Ready resolves to undefined -> falsy, so the row is treated the
    // same as any other not-ready row: excluded from both rows and
    // skipped, per the "not-ready rows are not reported" contract.
    const { rows, skipped } = normalizeMoneyOutRows(
      [MONEY_OUT_HEADER, []],
      "Money Out",
    );
    expect(rows).toEqual([]);
    expect(skipped).toEqual([]);
  });

  it("an entirely empty values array for Money Out fails closed", () => {
    const { rows, skipped } = normalizeMoneyOutRows([], "Money Out");
    expect(rows).toEqual([]);
    expect(skipped).toEqual([
      { tab: "Money Out", rowNumber: 1, reason: "missing header row" },
    ]);
  });
});
