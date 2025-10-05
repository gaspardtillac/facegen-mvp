import { NextResponse } from "next/server";

/**
 * Stub de /api/remove-background pour éviter les erreurs TypeScript.
 * Répond toujours OK sans faire d'opération réelle.
 */

export async function POST(req: Request) {
  try {
    // On lit le body pour être propre (et ignorer ce qui arrive)
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      await req.json().catch(() => null);
    } else if (ct.includes("multipart/form-data")) {
      await req.arrayBuffer().catch(() => null);
    } else {
      await req.arrayBuffer().catch(() => null);
    }

    return NextResponse.json({
      ok: true,
      message: "remove-background stub: aucune opération effectuée"
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { ok: false, message: "Utilisez POST sur /api/remove-background" },
    { status: 405 }
  );
}
