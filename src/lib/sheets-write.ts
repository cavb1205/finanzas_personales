import { google } from "googleapis";
import { rowFingerprint } from "@/lib/utils";

function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID env var is not set");
  return id;
}

/**
 * Append a row at the end of the data in a sheet tab.
 * `values` should match the column order (A, B, C, ...).
 */
export async function appendRow(sheetName: string, values: string[]) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: `'${sheetName}'!A:A`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

/**
 * Update a specific row in a sheet tab.
 * `rowIndex` is 0-based index from the data array (row 0 = header, row 1 = first data row).
 * In Sheets API, this maps to row `rowIndex + 1` (1-indexed).
 */
export async function updateRow(
  sheetName: string,
  rowIndex: number,
  values: string[]
) {
  const sheets = getSheetsClient();
  const sheetRow = rowIndex + 1; // convert to 1-indexed
  const endCol = String.fromCharCode(64 + values.length); // A=65, so 5 values → E
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range: `'${sheetName}'!A${sheetRow}:${endCol}${sheetRow}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [values] },
  });
}

/**
 * Delete a specific row from a sheet tab.
 * `rowIndex` is 0-based from the data array (includes header).
 * Requires the numeric sheetId (tab ID), which we resolve by name.
 */
export async function deleteRow(sheetName: string, rowIndex: number) {
  const sheets = getSheetsClient();
  const spreadsheetId = getSheetId();

  // Resolve the numeric sheet ID for the named tab
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties",
  });
  const tab = meta.data.sheets?.find(
    (s) => s.properties?.title === sheetName
  );
  if (!tab?.properties?.sheetId && tab?.properties?.sheetId !== 0) {
    throw new Error(`Sheet tab "${sheetName}" not found`);
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: tab.properties.sheetId,
              dimension: "ROWS",
              startIndex: rowIndex, // 0-based, inclusive
              endIndex: rowIndex + 1, // exclusive
            },
          },
        },
      ],
    },
  });
}

/**
 * Read a single row from a sheet to verify its content before mutating.
 * Returns the raw cell values as string array, or null if row doesn't exist.
 */
export async function readRow(
  sheetName: string,
  rowIndex: number
): Promise<string[] | null> {
  const sheets = getSheetsClient();
  const sheetRow = rowIndex + 1;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: `'${sheetName}'!A${sheetRow}:Z${sheetRow}`,
  });
  const rows = response.data.values;
  return rows && rows.length > 0 ? rows[0] : null;
}

export { rowFingerprint };

/**
 * Verify that the row at `rowIndex` still matches the expected fingerprint.
 * Throws if there's a mismatch (someone edited the sheet externally).
 */
export async function verifyRow(
  sheetName: string,
  rowIndex: number,
  expectedFingerprint: string
): Promise<void> {
  const current = await readRow(sheetName, rowIndex);
  if (!current) {
    throw new Error("La fila ya no existe en la hoja");
  }
  if (rowFingerprint(current) !== expectedFingerprint) {
    throw new Error(
      "La fila fue modificada externamente. Recarga la página e intenta de nuevo."
    );
  }
}
