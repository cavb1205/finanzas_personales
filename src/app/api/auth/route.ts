import { NextRequest, NextResponse } from "next/server";
import { verifyToken, createAuthResponse } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = body.token;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token requerido" },
        { status: 400 }
      );
    }

    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: "Token incorrecto" },
        { status: 401 }
      );
    }

    return createAuthResponse();
  } catch {
    return NextResponse.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}
