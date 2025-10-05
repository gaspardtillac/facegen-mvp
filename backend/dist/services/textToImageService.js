"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textToImageService = void 0;
const genai_1 = require("@google/genai");
const client = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
exports.textToImageService = {
    async generateImage(prompt) {
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
            // L'image est dans parts[1].inlineData.data (parts[0] contient du texte d'intro)
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
        }
        catch (error) {
            console.error('Gemini API error:', error);
            return { success: false, error: error.message };
        }
    }
};
