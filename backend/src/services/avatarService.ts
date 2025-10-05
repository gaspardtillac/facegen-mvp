import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const avatarService = {
  async generateWithFace(prompt: string, imageBase64: string, mimeType: string) {
    try {
      const result = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{
          role: 'user',
          parts: [
            { text: prompt },
            { 
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }],
        config: {
          responseModalities: ['image']
        }
      });
      
      const parts = result.candidates?.[0]?.content?.parts || [];
      
      for (const part of parts) {
        if (part.inlineData?.data) {
          return { 
            success: true, 
            imageUrl: `data:image/png;base64,${part.inlineData.data}` 
          };
        }
      }
      
      return { success: false, error: 'No image generated' };
    } catch (error: any) {
      console.error('Avatar generation error:', error);
      return { success: false, error: error.message };
    }
  }
};
