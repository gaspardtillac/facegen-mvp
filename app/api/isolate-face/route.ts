import { NextResponse } from "next/server";

/**
 * Stub de /api/isolate-face pour éviter les erreurs TypeScript en build.
 * Il ne fait rien de spécial (pas de traitement d'image), mais répond OK.
 */

export async function POST(req: Request) {
  try {
    // On consomme le body pour éviter les warnings de stream non lu
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      await req.json().catch(() => null);
    } else if (ct.includes("multipart/form-data")) {
      // Pas de parser ici, on ignore juste le flux
      await req.arrayBuffer().catch(() => null);
    } else {
      await req.arrayBuffer().catch(() => null);
    }

    return NextResponse.json({
      ok: true,
      message: "isolate-face stub: aucune opération effectuée"
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json(
    { ok: false, message: "Utilisez POST sur /api/isolate-face" },
    { status: 405 }
  );
}
