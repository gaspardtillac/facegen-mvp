import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convertir le fichier en base64 pour l'envoyer directement à Replicate
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({ imageUrl: dataUrl });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Erreur upload' }, { status: 500 });
  }
}
