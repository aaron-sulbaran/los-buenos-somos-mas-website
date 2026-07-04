import "server-only";
import { google } from "googleapis";
import { getEnv } from "@/lib/env";

/**
 * Read-only Google Sheets access via the service account. The service
 * account has no roles; it can only read what was explicitly shared
 * with it as Viewer. The site never writes.
 */

function getAuth(scopes: string[]) {
  const env = getEnv();
  return new google.auth.JWT({
    email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // Vercel and .env files store the key with literal \n sequences.
    key: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes,
  });
}

export async function fetchTabValues(
  tabName: string,
): Promise<{ data: string[][] | null; error: string | null }> {
  try {
    const env = getEnv();
    const sheets = google.sheets({
      version: "v4",
      auth: getAuth(["https://www.googleapis.com/auth/spreadsheets.readonly"]),
    });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: env.GOOGLE_SHEETS_ID,
      range: `'${tabName}'`,
    });
    const values = (response.data.values ?? []).map((row) =>
      row.map((cell) => String(cell ?? "")),
    );
    return { data: values, error: null };
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "unknown Sheets API error";
    return { data: null, error: `Failed to read tab "${tabName}": ${message}` };
  }
}

export function getDriveClient() {
  return google.drive({
    version: "v3",
    auth: getAuth(["https://www.googleapis.com/auth/drive.readonly"]),
  });
}
