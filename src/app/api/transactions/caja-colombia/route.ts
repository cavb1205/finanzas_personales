import { NextRequest, NextResponse } from "next/server";
import { checkAuth, unauthorizedResponse } from "@/lib/auth";
import { cajaTransactionSchema, mutationRequestSchema } from "@/lib/schemas";
import {
  appendRow,
  updateRow,
  deleteRow,
  verifyRow,
} from "@/lib/sheets-write";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const SHEET = "CAJA COLOMBIA";

function txToRow(data: z.infer<typeof cajaTransactionSchema>): string[] {
  return [
    data.fecha,
    data.categoria,
    data.descripcion,
    data.ingreso > 0 ? String(data.ingreso) : "",
    data.gasto > 0 ? String(data.gasto) : "",
  ];
}

function revalidate() {
  revalidatePath("/caja-colombia");
  revalidatePath("/");
  revalidatePath("/resumen");
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = cajaTransactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await appendRow(SHEET, txToRow(parsed.data));
  revalidate();
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest) {
  if (!checkAuth(request)) return unauthorizedResponse();

  const body = await request.json().catch(() => null);
  const parsed = cajaTransactionSchema.merge(mutationRequestSchema).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { rowIndex, fingerprint, ...data } = parsed.data;
  await verifyRow(SHEET, rowIndex, fingerprint);
  await updateRow(SHEET, rowIndex, txToRow(data));
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
