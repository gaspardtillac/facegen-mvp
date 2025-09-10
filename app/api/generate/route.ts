import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { prompt, faceImage } = await req.json();
    console.log("=== GOOGLE IMAGEN GENERATION ===");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${process.env.GEMINI_API_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a sharp, high-resolution, photorealistic portrait in: ${prompt}. Professional photography, DSLR camera quality, crisp details, natural skin texture, perfect focus, studio lighting, 4K resolution, hyperrealistic`
            }, {
              inline_data: {
                mime_type: "image/jpeg",
                data: faceImage.split(",")[1]
              }
            }]
          }]
        })
      }
    );

    const data = await response.json();
    
    // Vérifier si Google a bloqué la génération
    if (data.candidates && data.candidates[0] && data.candidates[0].finishReason === "PROHIBITED_CONTENT") {
      console.log("Content blocked by Google");
      return NextResponse.json({
        status: 400,
        working: false,
        hasImage: false,
        error: "CONTENT_BLOCKED",
        message: "Contenu bloqué par Google. Essayez avec une description différente.",
        shouldRefund: true
      });
    }
    
    // Vérifier si une image a été générée
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const parts = data.candidates[0].content.parts;
      const imagePart = parts.find(part => part.inlineData);
      
      if (imagePart) {
        console.log("HIGH QUALITY IMAGE GENERATED!");
        return NextResponse.json({
          status: 200,
          working: true,
          hasImage: true,
          imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
          message: "Image générée avec succès!",
          shouldRefund: false
        });
      }
    }
    
    // Génération échouée - rembourser le crédit
    console.log("Generation failed - no image returned");
    return NextResponse.json({
      status: 500,
      working: false,
      hasImage: false,
      error: "GENERATION_FAILED",
      message: "Génération échouée. Votre crédit a été remboursé.",
      shouldRefund: true
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      status: 500,
      working: false,
      hasImage: false,
      error: "API_ERROR",
      message: "Erreur technique. Votre crédit a été remboursé.",
      shouldRefund: true
    });
  }
}
