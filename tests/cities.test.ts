import { describe, expect, it } from "vitest";
import {
  lookupCityCoord,
  lookupCityLabel,
  normalizeCityName,
} from "@/lib/geo/cities";

describe("normalizeCityName", () => {
  it("folds case, accents, and whitespace", () => {
    expect(normalizeCityName("Maiquetía")).toBe("maiquetia");
    expect(normalizeCityName("  La   Guaira ")).toBe("la guaira");
    expect(normalizeCityName("NAIGUATÁ")).toBe("naiguata");
  });
});

describe("lookupCityCoord", () => {
  it("matches known cities regardless of case and accents", () => {
    expect(lookupCityCoord("la guaira")).not.toBeNull();
    expect(lookupCityCoord("Maiquetia")).toEqual(lookupCityCoord("Maiquetía"));
    expect(lookupCityCoord("Catia La Mar")).not.toBeNull();
  });

  it("returns null for unknown cities", () => {
    expect(lookupCityCoord("Valencia")).toBeNull();
    expect(lookupCityCoord("")).toBeNull();
  });

  it("places every required coastal town", () => {
    for (const name of [
      "Caracas",
      "La Guaira",
      "Caraballeda",
      "Catia La Mar",
      "Maiquetía",
      "Macuto",
      "Naiguatá",
    ]) {
      expect(lookupCityCoord(name)).not.toBeNull();
      expect(lookupCityLabel(name)).not.toBeNull();
    }
  });
});
