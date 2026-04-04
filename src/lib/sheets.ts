import { google } from "googleapis";

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });
const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function getSheetData(sheetName: string, range?: string) {
  const fullRange = range ? `'${sheetName}'!${range}` : `'${sheetName}'`;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: fullRange,
  });
  return response.data.values || [];
}

// --- Interfaces ---

export interface Transaction {
  fecha: string;
  categoria: string;
  descripcion: string;
  ingreso: number;
  gasto: number;
}

export interface MonthlySummary {
  month: string;
  ingresos: number;
  gastos: number;
  saldo: number;
}

export interface Prestamo {
  fecha: string;
  persona: string;
  operacion: string;
  monto: number;
  moneda: string;
  observaciones: string;
}

export interface PrestamoResumen {
  persona: string;
  deudaTotal: number;
  totalPagado: number;
  saldoPendiente: number;
}

export interface InvestmentEntry {
  etf: string;
  nombre: string;
  fechaCompra: string;
  cantidad: number;
  precioCompra: number;
  inversionInicial: number;
  precioActual: number;
  valorActual: number;
  ganancia: number;
  gananciaPercent: number;
}

export interface BusetaEntry {
  fecha: string;
  buseta: string;
  ruta: string;
  pasajeros: number;
  precioPasaje: number;
  brutoTotal: number;
  acpm: number;
  basico: number;
  varios: number;
  montajeLlanta: number;
  otros: number;
  totalGastos: number;
  netoTotal: number;
  nota: string;
}

export interface BusetaDashboard {
  month: string;
  bruto: number;
  gastos: number;
  neto: number;
}

export interface BusetaGastosDetalle {
  month: string;
  acpm: number;
  basico: number;
  varios: number;
  montajeLlanta: number;
  otros: number;
  totalGastos: number;
}

// --- Parsers ---

/** Handles CLP/COP format like "$1.580.000", "-$2.225.318", "$0" */
function parseCLPCOP(val: string | undefined): number {
  if (!val || val.trim() === "" || val === "—" || val === "-") return 0;
  const negative = val.includes("-");
  // Remove everything except digits
  const digits = val.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  const num = parseInt(digits, 10);
  if (isNaN(num)) return 0;
  return negative ? -num : num;
}

/** Parse a DD/MM/YYYY or similar date string to a sortable number (YYYYMMDD) */
function parseDateToSortKey(fecha: string): number {
  if (!fecha) return 0;
  // Handle formats: "1/01/2026", "01/01/2026", "05/03", "03-06-2025"
  const sep = fecha.includes("/") ? "/" : "-";
  const parts = fecha.split(sep);
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return parseInt(y) * 10000 + parseInt(m) * 100 + parseInt(d);
  }
  return 0;
}

/** Handles USD format like " $USD166,05", "- $USD11,44", "0,07018491" */
function parseUSD(val: string | undefined): number {
  if (!val || val.trim() === "" || val === "—" || val === "-") return 0;
  const negative = val.includes("-");
  // Remove $USD, $, spaces
  let cleaned = val.replace(/\$USD/g, "").replace(/\$/g, "").trim();
  if (cleaned.startsWith("-")) cleaned = cleaned.substring(1).trim();
  // Handle dot as thousands separator and comma as decimal: "6.724,50" -> "6724.50"
  // But also handle "0,07018491" (no dots) -> "0.07018491"
  if (cleaned.includes(".") && cleaned.includes(",")) {
    // e.g., "6.724,50" -> dots are thousands, comma is decimal
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    // e.g., "166,05" or "0,07018491" -> comma is decimal
    cleaned = cleaned.replace(",", ".");
  }
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return negative ? -num : num;
}

/** Handles percentage format like "77,33%", "-38,70%", "6,74%" */
function parsePercent(val: string | undefined): number {
  if (!val || val.trim() === "") return 0;
  const negative = val.includes("-");
  const cleaned = val.replace(/[-%]/g, "").replace(",", ".").trim();
  const num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return negative ? -num : num;
}

// --- Data fetchers ---

export async function getCajaChile(): Promise<{
  transactions: Transaction[];
  summary: MonthlySummary[];
}> {
  const rows = await getSheetData("CAJA CHILE");
  if (rows.length < 2) return { transactions: [], summary: [] };

  const transactions: Transaction[] = [];
  const summary: MonthlySummary[] = [];

  // The summary is in columns 6-9 (G-J) of the first few rows
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Parse summary from columns G-J (indices 6-9)
    const monthLabel = row[6];
    if (monthLabel && monthLabel !== "" && !monthLabel.startsWith("Suma")) {
      const ingresos = parseCLPCOP(row[7]);
      const gastos = parseCLPCOP(row[8]);
      const saldo = parseCLPCOP(row[9]);
      if (monthLabel.startsWith("2026")) {
        summary.push({ month: monthLabel, ingresos, gastos, saldo });
      }
    }
  }

  // Parse transactions from columns A-E
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0]) continue;

    const fecha = row[0] || "";
    const categoria = (row[1] || "").toLowerCase();
    const descripcion = row[2] || "";
    const ingreso = parseCLPCOP(row[3]);
    const gasto = parseCLPCOP(row[4]);

    if (ingreso > 0 || gasto > 0 || descripcion) {
      transactions.push({ fecha, categoria, descripcion, ingreso, gasto });
    }
  }

  // Sort most recent first
  transactions.sort(
    (a, b) => parseDateToSortKey(b.fecha) - parseDateToSortKey(a.fecha)
  );

  return { transactions, summary };
}

export async function getCajaColombia(): Promise<{
  transactions: Transaction[];
  investmentSummary: {
    totalInvertido: number;
    recuperado: number;
    saldoPorRecuperar: number;
    porcentajeRecuperacion: number;
  };
  remesaDetalle: { motivo: string; valor: number }[];
}> {
  const rows = await getSheetData("CAJA COLOMBIA");
  if (rows.length < 2)
    return {
      transactions: [],
      investmentSummary: {
        totalInvertido: 0,
        recuperado: 0,
        saldoPorRecuperar: 0,
        porcentajeRecuperacion: 0,
      },
      remesaDetalle: [],
    };

  const transactions: Transaction[] = [];
  let totalInvertido = 0;
  let recuperado = 0;
  let saldoPorRecuperar = 0;
  let porcentajeRecuperacion = 0;
  const remesaDetalle: { motivo: string; valor: number }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Parse transactions from cols A-E
    if (row[0] && row[0].trim() !== "") {
      transactions.push({
        fecha: row[0] || "",
        categoria: row[1] || "",
        descripcion: row[2] || "",
        ingreso: parseCLPCOP(row[3]),
        gasto: parseCLPCOP(row[4]),
      });
    }

    // Parse investment summary from cols G-H
    const concepto = (row[7] || "").trim();
    const valor = row[8] || "";
    if (concepto === "Total Invertido") totalInvertido = parseCLPCOP(valor);
    if (concepto === "Recuperado a la Fecha") recuperado = parseCLPCOP(valor);
    if (concepto === "Saldo por recuperar")
      saldoPorRecuperar = parseCLPCOP(valor);
    if (concepto === "% de recuperación")
      porcentajeRecuperacion = parsePercent(valor);

    // Parse remesa detail from cols N-O (indices 14-15)
    const motivo = row[14];
    const valorRemesa = row[15];
    if (motivo && motivo.trim() !== "" && valorRemesa) {
      remesaDetalle.push({
        motivo: motivo.trim(),
        valor: parseCLPCOP(valorRemesa),
      });
    }
  }

  transactions.sort(
    (a, b) => parseDateToSortKey(b.fecha) - parseDateToSortKey(a.fecha)
  );

  return {
    transactions,
    investmentSummary: {
      totalInvertido,
      recuperado,
      saldoPorRecuperar,
      porcentajeRecuperacion,
    },
    remesaDetalle,
  };
}

export async function getPrestamos(): Promise<{
  movimientos: Prestamo[];
  resumen: PrestamoResumen[];
}> {
  const rows = await getSheetData("LIBRO AUX PRESTAMOS");
  if (rows.length < 2) return { movimientos: [], resumen: [] };

  const movimientos: Prestamo[] = [];
  const resumenMap = new Map<string, PrestamoResumen>();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Summary is in cols H-K (indices 7-10) on the same rows as transactions
    if (row[7] && row[7].trim() !== "") {
      resumenMap.set(row[7], {
        persona: row[7],
        deudaTotal: parseCLPCOP(row[8]),
        totalPagado: parseCLPCOP(row[9]),
        saldoPendiente: parseCLPCOP(row[10]),
      });
    }

    // Transactions in cols A-F
    if (!row[0] || row[0].trim() === "") continue;

    movimientos.push({
      fecha: row[0] || "",
      persona: row[1] || "",
      operacion: row[2] || "",
      monto: parseCLPCOP(row[3]),
      moneda: row[4] || "COP",
      observaciones: row[5] || "",
    });
  }

  movimientos.sort((a, b) => parseDateToSortKey(b.fecha) - parseDateToSortKey(a.fecha));

  return {
    movimientos,
    resumen: Array.from(resumenMap.values()),
  };
}

export async function getPortafolio(): Promise<{
  entries: InvestmentEntry[];
  resumen: {
    inversionTotal: number;
    valorActual: number;
    ganancia: number;
    gananciaPercent: number;
  };
}> {
  const rows = await getSheetData("PORTAFOLIO");
  if (rows.length < 2)
    return {
      entries: [],
      resumen: {
        inversionTotal: 0,
        valorActual: 0,
        ganancia: 0,
        gananciaPercent: 0,
      },
    };

  const entries: InvestmentEntry[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    // Only rows with ETF ticker in col A (GOOG or BTC)
    if (!row[0] || row[0].trim() === "") continue;
    const etf = row[0].trim();
    if (etf !== "GOOG" && etf !== "BTC") continue;

    entries.push({
      etf,
      nombre: (row[1] || "").trim(),
      fechaCompra: row[2] || "",
      cantidad: parseUSD(row[3]),
      precioCompra: parseUSD(row[4]),
      inversionInicial: parseUSD(row[5]),
      precioActual: parseUSD(row[6]),
      valorActual: parseUSD(row[7]),
      ganancia: parseUSD(row[8]),
      gananciaPercent: parsePercent(row[9]),
    });
  }

  // Sort most recent first
  entries.sort((a, b) => parseDateToSortKey(b.fechaCompra) - parseDateToSortKey(a.fechaCompra));

  // Calculate totals from entries (more reliable than reading summary cells)
  const inversionTotal = entries.reduce((s, e) => s + e.inversionInicial, 0);
  const valorActualTotal = entries.reduce((s, e) => s + e.valorActual, 0);
  const gananciaTotal = entries.reduce((s, e) => s + e.ganancia, 0);
  const gananciaPercentTotal =
    inversionTotal > 0 ? (gananciaTotal / inversionTotal) * 100 : 0;

  return {
    entries,
    resumen: {
      inversionTotal,
      valorActual: valorActualTotal,
      ganancia: gananciaTotal,
      gananciaPercent: gananciaPercentTotal,
    },
  };
}

export async function getControlBusetas(): Promise<BusetaEntry[]> {
  const rows = await getSheetData("CONTROL BUSETAS");
  if (rows.length < 2) return [];

  const entries: BusetaEntry[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] || row[0].trim() === "") continue;

    entries.push({
      fecha: row[0] || "",
      buseta: row[1] || "",
      ruta: row[2] || "",
      pasajeros: parseCLPCOP(row[5]),
      precioPasaje: parseCLPCOP(row[6]),
      brutoTotal: parseCLPCOP(row[7]),
      acpm: parseCLPCOP(row[8]),
      basico: parseCLPCOP(row[9]),
      varios: parseCLPCOP(row[10]),
      montajeLlanta: parseCLPCOP(row[11]),
      otros: parseCLPCOP(row[12]),
      totalGastos: parseCLPCOP(row[13]),
      netoTotal: parseCLPCOP(row[14]),
      nota: row[15] || "",
    });
  }

  entries.sort((a, b) => parseDateToSortKey(b.fecha) - parseDateToSortKey(a.fecha));

  return entries;
}

export async function getDashboardBusetas(): Promise<{
  monthly: BusetaDashboard[];
  gastos: BusetaGastosDetalle[];
  gananciaAnterior: number;
  gananciaActual: number;
  crecimiento: number;
}> {
  const rows = await getSheetData("DASHBOARD BUSETAS");
  if (rows.length < 2)
    return {
      monthly: [],
      gastos: [],
      gananciaAnterior: 0,
      gananciaActual: 0,
      crecimiento: 0,
    };

  const monthly: BusetaDashboard[] = [];
  const gastos: BusetaGastosDetalle[] = [];
  let gananciaAnterior = 0;
  let gananciaActual = 0;
  let crecimiento = 0;

  // Header row has: [0]="Fecha - Año-Mes", [5]="Ganancia Mes Anterior", [6]=value
  gananciaAnterior = parseCLPCOP(rows[0][6]);

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];

    // Monthly summary cols A-D
    if (row[0] && row[0].startsWith("2026")) {
      monthly.push({
        month: row[0],
        bruto: parseCLPCOP(row[1]),
        gastos: parseCLPCOP(row[2]),
        neto: parseCLPCOP(row[3]),
      });
    }

    // Right side: ganancia actual, crecimiento
    const label = (row[5] || "").trim();
    if (label === "Ganancia Mes Actual") gananciaActual = parseCLPCOP(row[6]);
    if (label === "Crecimiento") crecimiento = parsePercent(row[6]);

    // Gastos detail cols K-Q (indices 11-17)
    if (row[11] && row[11].startsWith("2026")) {
      gastos.push({
        month: row[11],
        acpm: parseCLPCOP(row[12]),
        basico: parseCLPCOP(row[13]),
        varios: parseCLPCOP(row[14]),
        montajeLlanta: parseCLPCOP(row[15]),
        otros: parseCLPCOP(row[16]),
        totalGastos: parseCLPCOP(row[17]),
      });
    }
  }

  return { monthly, gastos, gananciaAnterior, gananciaActual, crecimiento };
}

export async function getApartamento(): Promise<{
  meta: number;
  valorTotal: number;
  totalAportado: number;
  saldoPendiente: number;
  aportesMensuales: { mes: string; valor: number; acumulado: number }[];
}> {
  const rows = await getSheetData("APARTAMENTO");

  let meta = 0;
  let valorTotal = 0;
  let totalAportado = 0;
  let saldoPendiente = 0;
  const aportesMensuales: { mes: string; valor: number; acumulado: number }[] =
    [];

  // Row 0: header has "AHORRO PARA APARTAMENTO 94000000" in col C
  const headerMatch = (rows[0]?.[2] || "").match(/(\d+)/);
  if (headerMatch) meta = parseInt(headerMatch[1], 10);

  // Row 1: [5]="$40.500.000" (aportes actuales), [6]="$138.480.000" (saldo pendiente)
  if (rows[1]) {
    totalAportado = parseCLPCOP(rows[1][5]);
    saldoPendiente = parseCLPCOP(rows[1][6]);
  }

  // Row 6: [5]="$178.980.000" (valor total apartamento)
  if (rows[6]) {
    valorTotal = parseCLPCOP(rows[6][5]);
  }

  // Monthly entries from row 2 onwards: [1]=mes, [2]=valor, [3]=acumulado
  for (let i = 2; i < rows.length; i++) {
    const row = rows[i];
    if (!row[1] || row[1].trim() === "" || row[1] === "TOTAL ") continue;
    if (row[2] === "META" || row[2] === "SALDO POR RECOGER") continue;

    const mes = row[1];
    const valor = parseCLPCOP(row[2]);
    const acumulado = parseCLPCOP(row[3]);
    if (mes) {
      aportesMensuales.push({ mes, valor, acumulado });
    }
  }

  return { meta, valorTotal, totalAportado, saldoPendiente, aportesMensuales };
}

export async function getCuadreCaja(): Promise<{
  terminales: { nombre: string; sistema: number; caja: number }[];
  cuentas: { nombre: string; saldo: number; deuda: number }[];
  totalTerminales: number;
  totalCuentas: number;
  saldoFavor: number;
  monthly2025: { month: string; total: number }[];
  monthly2026: { month: string; total: number }[];
}> {
  const rows = await getSheetData("CUADRE CAJA");

  const terminales: { nombre: string; sistema: number; caja: number }[] = [];
  const cuentas: { nombre: string; saldo: number; deuda: number }[] = [];
  let totalTerminales = 0;
  let totalCuentas = 0;
  let saldoFavor = 0;

  // Terminales: rows 20-22 (indices), cols A-C
  const terminalNames = ["Kiara", "TyC", "JOHAN"];
  for (let i = 20; i <= 22 && i < rows.length; i++) {
    const row = rows[i];
    if (row[0]) {
      terminales.push({
        nombre: row[0],
        sistema: parseCLPCOP(row[1]),
        caja: parseCLPCOP(row[2]),
      });
    }
  }

  // Cuentas: rows 20-25, cols D-F
  const cuentaRows = [
    { idx: 20, nombre: "Cuenta Corriente" },
    { idx: 21, nombre: "Cuenta Rut" },
    { idx: 22, nombre: "Cuenta Ahorros" },
    { idx: 23, nombre: "Santander" },
    { idx: 24, nombre: "Falabella" },
    { idx: 25, nombre: "Erika" },
  ];
  for (const { idx, nombre } of cuentaRows) {
    if (idx < rows.length) {
      cuentas.push({
        nombre,
        saldo: parseCLPCOP(rows[idx]?.[5]),
        deuda: parseCLPCOP(rows[idx]?.[6]),
      });
    }
  }

  // Totals from row 19 area
  if (rows[19]) {
    totalTerminales = parseCLPCOP(rows[19][8]); // "TOTAL TERMINALES"
    totalCuentas = parseCLPCOP(rows[19][9]); // "TOTAL CAJA+CUENTAS"
  }
  if (rows[22]) {
    saldoFavor = parseCLPCOP(rows[22][8]); // "SALDO FAVOR - CONTRA"
  }

  // Monthly data 2025: rows 26-37, last column (index 22) is TOTAL
  const months2025 = [
    "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
    "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
  ];
  const monthly2025: { month: string; total: number }[] = [];
  for (let i = 26; i <= 37 && i < rows.length; i++) {
    const row = rows[i];
    const monthIdx = i - 26;
    if (monthIdx < months2025.length) {
      monthly2025.push({
        month: months2025[monthIdx],
        total: parseCLPCOP(row[22]),
      });
    }
  }

  // Monthly data 2026: rows 41-52
  const monthly2026: { month: string; total: number }[] = [];
  for (let i = 41; i <= 52 && i < rows.length; i++) {
    const row = rows[i];
    const monthIdx = i - 41;
    if (monthIdx < months2025.length) {
      monthly2026.push({
        month: months2025[monthIdx],
        total: parseCLPCOP(row[22]),
      });
    }
  }

  return {
    terminales,
    cuentas,
    totalTerminales,
    totalCuentas,
    saldoFavor,
    monthly2025,
    monthly2026,
  };
}
