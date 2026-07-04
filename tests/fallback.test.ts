import { describe, expect, it } from "vitest";
import { pickLocalized } from "@/lib/i18n/fallback";

describe("pickLocalized", () => {
  it("returns English when present and selected", () => {
    expect(pickLocalized("en", "Hola", "Hello")).toBe("Hello");
  });

  it("falls back to Spanish when the English cell is blank", () => {
    expect(pickLocalized("en", "Hola", "")).toBe("Hola");
    expect(pickLocalized("en", "Hola", "   ")).toBe("Hola");
    expect(pickLocalized("en", "Hola", undefined)).toBe("Hola");
  });

  it("always returns Spanish in Spanish mode", () => {
    expect(pickLocalized("es", "Hola", "Hello")).toBe("Hola");
  });
});
