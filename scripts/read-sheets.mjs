import { google } from "googleapis";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local manually
const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
let currentKey = null;
let currentValue = "";
let inMultiline = false;

for (const line of envContent.split("\n")) {
  if (inMultiline) {
    currentValue += "\n" + line;
    if (line.includes('"') && !line.endsWith("\\n\"")) {
      // might be end of multiline
    }
    if (
      currentValue.endsWith('"') ||
      currentValue.endsWith('"\n') ||
      line.trim() === '"'
    ) {
      env[currentKey] = currentValue.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
      inMultiline = false;
    }
  } else {
    const match = line.match(/^([^=]+)=(.*)/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if (val.startsWith('"') && !val.endsWith('"')) {
        currentKey = key;
        currentValue = val;
        inMultiline = true;
      } else {
        env[key] = val.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
      }
    }
  }
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });
const SHEET_ID = env.GOOGLE_SHEET_ID;

// Get all sheet names first
const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
const sheetNames = spreadsheet.data.sheets.map((s) => s.properties.title);

console.log("=== HOJAS ENCONTRADAS ===");
console.log(sheetNames.join(", "));
console.log("");

for (const name of sheetNames) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`=== HOJA: "${name}" ===`);
  console.log("=".repeat(60));

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${name}'`,
  });

  const rows = response.data.values || [];
  console.log(`Filas: ${rows.length}`);

  if (rows.length === 0) {
    console.log("(vacía)");
    continue;
  }

  // Print header
  console.log(`Columnas: ${rows[0].length}`);
  console.log(`\nENCABEZADOS: ${JSON.stringify(rows[0])}`);

  // Print all rows
  console.log("\nDATOS:");
  for (let i = 0; i < rows.length; i++) {
    console.log(`  [${i}] ${JSON.stringify(rows[i])}`);
  }
}
