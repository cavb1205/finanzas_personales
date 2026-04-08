import { NextRequest, NextResponse } from "next/server";
import { checkAuth, unauthorizedResponse } from "@/lib/auth";
import { portafolioSchema, mutationRequestSchema } from "@/lib/schemas";
import { appendRow, updateRow, deleteRow, verifyRow } from "@/lib/sheets-write";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SHEET = "PORTAFOLIO";

function portafolioToRow(d: z.infer<typeof portafolioSchema>): string[] {
  return [
    d.etf,
    d.nombre,
    d.fechaCompra,
    String(d.cantidad),
    String(d.precioCompra),
    String(d.inversionInicial),
  ];
}

function revalidate() {
  revalidatePath("/portafolio");
  revalidatePath("/");
  revalidatePath("/resumen");
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();
  const body = await request.json().catch(() => null);
  const parsed = portafolioSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  await appendRow(SHEET, portafolioToRow(parsed.data));
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();
  const body = await request.json().catch(() => null);
  const parsed = portafolioSchema.merge(mutationRequestSchema).safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { rowIndex, fingerprint, ...data } = parsed.data;
  await verifyRow(SHEET, rowIndex, fingerprint);
  await updateRow(SHEET, rowIndex, portafolioToRow(data));
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
