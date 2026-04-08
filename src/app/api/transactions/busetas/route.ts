import { NextRequest, NextResponse } from "next/server";
import { checkAuth, unauthorizedResponse } from "@/lib/auth";
import { busetaSchema, mutationRequestSchema } from "@/lib/schemas";
import { appendRow, updateRow, deleteRow, verifyRow } from "@/lib/sheets-write";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SHEET = "CONTROL BUSETAS";

function busetaToRow(d: z.infer<typeof busetaSchema>): string[] {
  return [
    d.fecha,
    d.buseta,
    d.ruta,
    "", // col D — empty (cols D-E unused per parser: pasajeros is col F = index 5)
    "", // col E
    String(d.pasajeros),
    String(d.precioPasaje),
    String(d.brutoTotal),
    String(d.acpm),
    String(d.basico),
    String(d.varios),
    String(d.montajeLlanta),
    String(d.otros),
    String(d.totalGastos),
    String(d.netoTotal),
    d.nota,
  ];
}

function revalidate() {
  revalidatePath("/busetas");
  revalidatePath("/");
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();
  const body = await request.json().catch(() => null);
  const parsed = busetaSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await appendRow(SHEET, busetaToRow(parsed.data));
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();
  const body = await request.json().catch(() => null);
  const parsed = busetaSchema.merge(mutationRequestSchema).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { rowIndex, fingerprint, ...data } = parsed.data;
  await verifyRow(SHEET, rowIndex, fingerprint);
  await updateRow(SHEET, rowIndex, busetaToRow(data));
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();
  const body = await request.json().catch(() => null);
  const parsed = mutationRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { rowIndex, fingerprint } = parsed.data;
  await verifyRow(SHEET, rowIndex, fingerprint);
  await deleteRow(SHEET, rowIndex);
  revalidate();
  return NextResponse.json({ ok: true });
}
