import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, faceImage } = body;
    
    if (!faceImage || !prompt) {
      return NextResponse.json({
        hasImage: false,
        message: "Image et prompt requis",
        shouldRefund: true
      }, { status: 400 });
    }
    
    console.log("=== GOOGLE IMAGEN HIGH QUALITY ===");
    
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
    console.log("Response:", JSON.stringify(data).slice(0, 200));
    
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
          message: "Image haute qualité générée!"
        });
      }
    }
    
    console.log("Content blocked by Google");
    return NextResponse.json({
      status: 200,
      working: false,
      hasImage: false,
      message: "Génération échouée - contenu potentiellement bloqué",
      shouldRefund: true
    });
    
  } catch (error) {
    console.error("GEN ERROR:", error);
    return NextResponse.json({ 
      hasImage: false,
      message: error.message,
      shouldRefund: true
    }, { status: 500 });
  }
}
