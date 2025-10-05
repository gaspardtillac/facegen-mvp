import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async generateImage(prompt: string) {
    try {
      const result = await client.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
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
            text: `data:image/png;base64,${part.inlineData.data}` 
          };
        }
      }
      
      return { success: false, error: 'No image generated' };
    } catch (error: any) {
      console.error('Gemini API error:', error);
      return { success: false, error: error.message };
    }
  }
};
