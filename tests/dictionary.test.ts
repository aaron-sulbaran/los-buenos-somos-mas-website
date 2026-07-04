import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { t, type DictKey } from "@/lib/i18n/dictionary";

/**
 * Dictionary audit, per AGENTS.md i18n rules: "Every user-facing string
 * is bilingual... Never render a mixed or empty string." The `dict`
 * object in lib/i18n/dictionary.ts is intentionally not exported (only
 * `t`, `DictKey`, and `DEFAULT_LANG` are), so this test extracts the real
 * key list straight from the source file and audits every key through
 * the actual `t()` function, rather than re-implementing or duplicating
 * the dictionary's data in the test.
 */

const DICTIONARY_PATH = path.resolve(
  import.meta.dirname,
  "../lib/i18n/dictionary.ts",
);
const DICTIONARY_SOURCE = readFileSync(DICTIONARY_PATH, "utf8");

function extractDictKeys(source: string): string[] {
  const start = source.indexOf("const dict = {");
  const end = source.indexOf("} as const;");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(
      "Could not locate `const dict = { ... } as const;` in dictionary.ts; " +
        "the audit's key extraction needs updating to match the new shape.",
    );
  }
  const body = source.slice(start, end);
  const keyPattern = /^\s*"([^"]+)":\s*\{/gm;
  const keys: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = keyPattern.exec(body)) !== null) {
    keys.push(match[1]);
  }
  return keys;
}

describe("dictionary audit", () => {
  const keys = extractDictKeys(DICTIONARY_SOURCE);

  it("finds dictionary keys to audit (guards against a silent extraction miss)", () => {
    expect(keys.length).toBeGreaterThan(5);
  });

  it("every key has a non-empty English value", () => {
    const offenders = keys.filter((key) => {
      const value = t(key as DictKey, "en");
      return typeof value !== "string" || value.trim() === "";
    });
    expect(offenders).toEqual([]);
  });

  it("every key has a non-empty Spanish value", () => {
    const offenders = keys.filter((key) => {
      const value = t(key as DictKey, "es");
      return typeof value !== "string" || value.trim() === "";
    });
    expect(offenders).toEqual([]);
  });
});
