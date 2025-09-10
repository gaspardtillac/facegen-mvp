import { NextResponse } from "next/server";
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();
    
    console.log("=== SUPPRESSION ARRIERE-PLAN ===");
    
    const imageBuffer = Buffer.from(imageUrl.split(",")[1], "base64");
    
    // Version simplifiée : juste nettoyer l'image
    const cleanImage = await sharp(imageBuffer)
      .jpeg({ quality: 95 })
      .toBuffer();
    
    const base64Result = `data:image/jpeg;base64,${cleanImage.toString('base64')}`;
    
    return NextResponse.json({ 
      success: true, 
      cleanImage: base64Result 
    });
    
  } catch (error) {
    console.error("REMOVE BG ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
