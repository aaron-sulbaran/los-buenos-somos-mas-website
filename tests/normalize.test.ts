import { describe, expect, it } from "vitest";
import {
  cleanOptional,
  extractDriveFileId,
  parseAmountUsd,
  parseDateLenient,
  parsePublicLink,
  parseReady,
  parseReceiptLinks,
} from "@/lib/sheets/normalize";

describe("parseAmountUsd", () => {
  it("strips currency formatting", () => {
    expect(parseAmountUsd("$1,234.56")).toBe(1234.56);
    expect(parseAmountUsd("  $50 ")).toBe(50);
    expect(parseAmountUsd("75.5")).toBe(75.5);
  });

  it("rejects zero, negatives, and junk", () => {
    expect(parseAmountUsd("$0")).toBeNull();
    expect(parseAmountUsd("-5")).toBeNull();
    expect(parseAmountUsd("pending")).toBeNull();
    expect(parseAmountUsd("")).toBeNull();
    expect(parseAmountUsd(undefined)).toBeNull();
  });
});

describe("parseDateLenient", () => {
  it("accepts US-style and ISO dates", () => {
    expect(parseDateLenient("6/28/2026")).toBe("2026-06-28");
    expect(parseDateLenient("12/1/26")).toBe("2026-12-01");
    expect(parseDateLenient("2026-06-28")).toBe("2026-06-28");
  });

  it("rejects junk and impossible dates", () => {
    expect(parseDateLenient("pending")).toBeNull();
    expect(parseDateLenient("13/45/2026")).toBeNull();
    expect(parseDateLenient("")).toBeNull();
    expect(parseDateLenient(undefined)).toBeNull();
  });
});

describe("extractDriveFileId", () => {
  const id = "FIXTUREaaaaaaaaaaaaaaaa1";

  it("handles the common share link shapes", () => {
    expect(
      extractDriveFileId(
        `https://drive.google.com/file/d/${id}/view?usp=sharing`,
      ),
    ).toBe(id);
    expect(extractDriveFileId(`https://drive.google.com/open?id=${id}`)).toBe(
      id,
    );
    expect(extractDriveFileId(id)).toBe(id);
  });

  it("rejects non-Drive strings", () => {
    expect(extractDriveFileId("https://example.org/photo.jpg")).toBeNull();
    expect(extractDriveFileId("short")).toBeNull();
    expect(extractDriveFileId("")).toBeNull();
  });
});

describe("parseReceiptLinks", () => {
  it("splits, extracts, and dedupes", () => {
    const a = "FIXTUREaaaaaaaaaaaaaaaa1";
    const b = "FIXTUREbbbbbbbbbbbbbbbb2";
    const cell = `https://drive.google.com/file/d/${a}/view, https://drive.google.com/open?id=${b}\nhttps://drive.google.com/file/d/${a}/view`;
    expect(parseReceiptLinks(cell)).toEqual([a, b]);
  });

  it("drops invalid links and returns empty for blank cells", () => {
    expect(parseReceiptLinks("not a link, also junk")).toEqual([]);
    expect(parseReceiptLinks(undefined)).toEqual([]);
  });
});

describe("parseReady", () => {
  it("accepts sheet checkbox TRUE and common truthy spellings", () => {
    expect(parseReady("TRUE")).toBe(true);
    expect(parseReady("true")).toBe(true);
    expect(parseReady("Sí")).toBe(true);
  });

  it("defaults to unpublished", () => {
    expect(parseReady("FALSE")).toBe(false);
    expect(parseReady("")).toBe(false);
    expect(parseReady(undefined)).toBe(false);
    expect(parseReady("maybe")).toBe(false);
  });
});

describe("cleanOptional and parsePublicLink", () => {
  it("turns blanks into undefined", () => {
    expect(cleanOptional("  ")).toBeUndefined();
    expect(cleanOptional(undefined)).toBeUndefined();
    expect(cleanOptional(" Barbs ")).toBe("Barbs");
  });

  it("only accepts http(s) public links", () => {
    expect(parsePublicLink("https://instagram.com/p/abc")).toBe(
      "https://instagram.com/p/abc",
    );
    expect(parsePublicLink("javascript:alert(1)")).toBeUndefined();
    expect(parsePublicLink("not a url")).toBeUndefined();
    expect(parsePublicLink("")).toBeUndefined();
  });
});
