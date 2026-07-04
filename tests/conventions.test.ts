import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Static convention sweeps, per AGENTS.md "Locked conventions":
 * - "No em dashes anywhere, including JSX text, and no &mdash;."
 * - "No hardcoded hex in JSX; always use bg-background, text-muted, ..."
 * - Typography: "Never reach for Inter, Roboto, Playfair, or system
 *   stacks" -- only Fraunces, Instrument Sans, Newsreader, Spectral are
 *   loaded via next/font/google (the last two are in flight for the
 *   font-decision toggle per Layer 2 "In flight").
 *
 * These sweep app/, components/, and lib/ so a future regression (a
 * pasted em dash, a stray hex color) fails CI instead of shipping.
 */

const ROOT = path.resolve(import.meta.dirname, "..");
const SCAN_DIRS = ["app", "components", "lib"];
const IGNORED_DIR_NAMES = new Set(["node_modules", ".next"]);

function collectFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (IGNORED_DIR_NAMES.has(entry.name) || entry.name.startsWith(".")) {
        continue;
      }
      out.push(...collectFiles(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      out.push(full);
    }
  }
  return out;
}

const ALL_SOURCE_FILES = SCAN_DIRS.flatMap((dir) =>
  collectFiles(path.join(ROOT, dir), [".ts", ".tsx"]),
);
const TSX_FILES = ALL_SOURCE_FILES.filter((file) => file.endsWith(".tsx"));

function relative(file: string): string {
  return path.relative(ROOT, file);
}

describe("no em dashes in app/, components/, or lib/", () => {
  it("contains no literal U+2014 em dash characters", () => {
    const offenders = ALL_SOURCE_FILES.filter((file) =>
      readFileSync(file, "utf8").includes("—"),
    ).map(relative);
    expect(offenders).toEqual([]);
  });

  it("contains no &mdash; HTML entities", () => {
    const offenders = ALL_SOURCE_FILES.filter((file) =>
      readFileSync(file, "utf8").includes("&mdash;"),
    ).map(relative);
    expect(offenders).toEqual([]);
  });
});

describe("no hardcoded hex colors in className or style (tsx)", () => {
  it("contains no arbitrary hex Tailwind values, e.g. bg-[#fff]", () => {
    const offenders = TSX_FILES.filter((file) =>
      /\[#[0-9a-fA-F]{3,8}\]/.test(readFileSync(file, "utf8")),
    ).map(relative);
    expect(offenders).toEqual([]);
  });

  it("contains no hex color literals inside style={{ }} blocks", () => {
    const offenders: string[] = [];
    for (const file of TSX_FILES) {
      const content = readFileSync(file, "utf8");
      const styleBlocks = content.match(/style=\{\{[\s\S]*?\}\}/g) ?? [];
      for (const block of styleBlocks) {
        if (/#[0-9a-fA-F]{3,8}/.test(block)) {
          offenders.push(relative(file));
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("next/font/google imports are limited to the locked families", () => {
  it("only imports Fraunces or Instrument_Sans (locked after walkthrough)", () => {
    const ALLOWED = new Set(["Fraunces", "Instrument_Sans"]);
    const offenders: string[] = [];
    for (const file of ALL_SOURCE_FILES) {
      const content = readFileSync(file, "utf8");
      const importMatch = content.match(
        /import\s*\{([^}]+)\}\s*from\s*["']next\/font\/google["']/,
      );
      if (!importMatch) continue;
      const names = importMatch[1]
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);
      for (const name of names) {
        if (!ALLOWED.has(name)) {
          offenders.push(`${relative(file)}: ${name}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});
