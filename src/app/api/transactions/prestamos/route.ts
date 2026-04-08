import { NextRequest, NextResponse } from "next/server";
import { checkAuth, unauthorizedResponse } from "@/lib/auth";
import { prestamoSchema, mutationRequestSchema } from "@/lib/schemas";
import {
  appendRow,
  updateRow,
  deleteRow,
  verifyRow,
} from "@/lib/sheets-write";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SHEET = "LIBRO AUX PRESTAMOS";

function prestamoToRow(data: z.infer<typeof prestamoSchema>): string[] {
  return [
    data.fecha,
    data.persona,
    data.operacion,
    String(data.monto),
    data.moneda,
    data.observaciones,
  ];
}

function revalidate() {
  revalidatePath("/prestamos");
  revalidatePath("/");
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = prestamoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await appendRow(SHEET, prestamoToRow(parsed.data));
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = prestamoSchema.merge(mutationRequestSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { rowIndex, fingerprint, ...data } = parsed.data;
  await verifyRow(SHEET, rowIndex, fingerprint);
  await updateRow(SHEET, rowIndex, prestamoToRow(data));
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = mutationRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { rowIndex, fingerprint } = parsed.data;
  await verifyRow(SHEET, rowIndex, fingerprint);
  await deleteRow(SHEET, rowIndex);
  revalidate();
  return NextResponse.json({ ok: true });
}
