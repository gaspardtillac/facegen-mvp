import { NextResponse } from "next/server";
import sharp from 'sharp';

export async function POST(req: Request) {
  try {
    const { imageUrl, mask, selection } = await req.json();
    
    console.log("=== DEBUG ISOLATION ===");
    console.log("Selection:", selection);
    
    const originalBuffer = Buffer.from(imageUrl.split(",")[1], "base64");
    const maskBuffer = Buffer.from(mask.split(",")[1], "base64");
    
    // 1. Sauver l'image originale pour debug
    const originalMeta = await sharp(originalBuffer).metadata();
    console.log("Original size:", originalMeta.width, "x", originalMeta.height);
    
    // 2. Sauver le masque pour debug  
    const maskMeta = await sharp(maskBuffer).metadata();
    console.log("Mask size:", maskMeta.width, "x", maskMeta.height);
    
    // 3. Appliquer le masque de façon plus agressive
    const isolatedFace = await sharp(originalBuffer)
      .composite([
        {
          input: await sharp(maskBuffer)
            .greyscale()
            .threshold(128) // Convertir en noir/blanc pur
            .toBuffer(),
          blend: 'dest-in'
        }
      ])
      .png() // PNG pour transparence
      .toBuffer();
    
    // 4. Créer une version avec fond coloré pour voir la différence
    const withBackground = await sharp({
      create: {
        width: originalMeta.width,
        height: originalMeta.height,
        channels: 3,
        background: { r: 255, g: 0, b: 255 } // Fond magenta pour voir la différence
      }
    })
    .composite([
      {
        input: isolatedFace,
        blend: 'over'
      }
    ])
    .jpeg()
    .toBuffer();
    
    const base64Result = `data:image/jpeg;base64,${withBackground.toString('base64')}`;
    
    console.log("Isolation terminée avec fond magenta");
    
    return NextResponse.json({ 
      success: true, 
      isolatedImage: base64Result 
    });
    
  } catch (error) {
    console.error("ISOLATION ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
