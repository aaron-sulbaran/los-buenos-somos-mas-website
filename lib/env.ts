import "server-only";
import { z } from "zod";

/**
 * Environment contract. DATA_SOURCE defaults to "sheets" so a deployment
 * that forgets its credentials fails loudly instead of silently serving
 * fixture data. Local development opts into fixtures explicitly via
 * DATA_SOURCE=fixture in .env.local.
 */
const envSchema = z.object({
  DATA_SOURCE: z.enum(["fixture", "sheets"]).default("sheets"),
  GOOGLE_SHEETS_ID: z.string().trim().min(1).optional(),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().trim().email().optional(),
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: z.string().trim().min(1).optional(),
  GOOGLE_DRIVE_RECEIPTS_FOLDER_ID: z.string().trim().min(1).optional(),
  REVALIDATE_SECONDS: z.coerce.number().int().positive().default(60),
});

export type Env = z.infer<typeof envSchema>;

const REQUIRED_FOR_SHEETS = [
  "GOOGLE_SHEETS_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
] as const;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;

  // An env var set to an empty string (a blank line in .env.local)
  // means unset, so optionals stay optional and defaults apply.
  const raw = Object.fromEntries(
    Object.entries(process.env).filter(
      ([, value]) => value !== undefined && value.trim() !== "",
    ),
  );
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment configuration: ${parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ")}`,
    );
  }

  const env = parsed.data;
  if (env.DATA_SOURCE === "sheets") {
    const missing = REQUIRED_FOR_SHEETS.filter((key) => !env[key]);
    if (missing.length > 0) {
      throw new Error(
        `DATA_SOURCE=sheets requires ${missing.join(", ")}. ` +
          "Fill them in .env.local (see .env.example), or set DATA_SOURCE=fixture to develop with sample data.",
      );
    }
  }

  cached = env;
  return env;
}
