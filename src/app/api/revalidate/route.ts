import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/lib/auth";

const REVALIDATABLE_PATHS = [
  "/",
  "/caja-chile",
  "/caja-colombia",
  "/prestamos",
  "/busetas",
  "/portafolio",
] as const;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const path: string | undefined = body.path;

    if (path) {
      if (!REVALIDATABLE_PATHS.includes(path as (typeof REVALIDATABLE_PATHS)[number])) {
        return NextResponse.json(
          { error: "Ruta no válida", valid: REVALIDATABLE_PATHS },
          { status: 400 }
        );
      }
      revalidatePath(path);
      return NextResponse.json({ revalidated: [path] });
    }

    // No path specified — revalidate all
    for (const p of REVALIDATABLE_PATHS) {
      revalidatePath(p);
    }
    return NextResponse.json({ revalidated: [...REVALIDATABLE_PATHS] });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
