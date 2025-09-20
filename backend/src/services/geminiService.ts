import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class GeminiService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-image-preview' 
  });

  async generateImage(
    prompt: string, 
    imageBase64: string, 
    mimeType: string
  ): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
      const imagePart = {
        inlineData: {
          data: imageBase64,
          mimeType: mimeType
        }
      };

      const textPart = {
        text: `Create a sharp, high-resolution, photorealistic portrait in: ${prompt}. Professional photography, DSLR camera quality, crisp details, natural skin texture, perfect focus, studio lighting, 4K resolution, hyperrealistic`
      };

      const result = await this.model.generateContent([imagePart, textPart]);
      const response = await result.response;
      
      const candidates = response.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('Aucune image générée par le modèle');
      }

      const parts = candidates[0].content.parts;
      const imagePart2 = parts?.find(part => part.inlineData);
      
      if (!imagePart2?.inlineData) {
        throw new Error('Aucune image trouvée dans la réponse');
      }

      const generatedImageBase64 = imagePart2.inlineData.data;
      const generatedMimeType = imagePart2.inlineData.mimeType || 'image/png';
      
      return {
        success: true,
        imageUrl: `data:${generatedMimeType};base64,${generatedImageBase64}`
      };

    } catch (error) {
      console.error('Erreur Gemini:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }
}

export const geminiService = new GeminiService();
