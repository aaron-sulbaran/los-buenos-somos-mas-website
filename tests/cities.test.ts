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
    expect(lookupCityCoord("  maiquetia ")).toEqual(
      lookupCityCoord("Maiquetía"),
    );
  });

  it("returns null for unknown cities", () => {
    expect(lookupCityCoord("Valencia")).toBeNull();
    expect(lookupCityCoord("")).toBeNull();
  });

  it("places every required town within plausible Venezuela bounds", () => {
    for (const name of [
      "Caracas",
      "La Guaira",
      "Caraballeda",
      "Catia La Mar",
      "Maiquetía",
      "Macuto",
      "Naiguatá",
    ]) {
      const coord = lookupCityCoord(name);
      expect(coord).not.toBeNull();
      expect(lookupCityLabel(name)).not.toBeNull();
      // North-central coast and Caracas inland: real lat/lng, not SVG space.
      expect(coord!.lat).toBeGreaterThanOrEqual(10.3);
      expect(coord!.lat).toBeLessThanOrEqual(10.7);
      expect(coord!.lng).toBeGreaterThanOrEqual(-67.1);
      expect(coord!.lng).toBeLessThanOrEqual(-66.6);
    }
  });
});
