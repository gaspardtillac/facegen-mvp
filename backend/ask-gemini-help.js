const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBZIvboNrX7K6CjDNxMok2mmAearvYb2KM');

async function askGeminiForHelp() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
    
    const prompt = `
Je développe une application de génération d'avatars avec l'API Gemini. Mon code utilise le modèle "gemini-2.5-flash-image-preview" mais j'obtiens cette erreur :

"[404 Not Found] models/gemini-2.5-flash-image-preview is not found for API version v1, or is not supported for generateContent"

Voici les modèles disponibles avec ma clé API :
- models/gemini-2.5-flash
- models/gemini-2.5-pro  
- models/gemini-2.0-flash
- models/gemini-2.0-flash-001
- models/gemini-2.0-flash-lite-001
- models/gemini-2.0-flash-lite
- models/gemini-2.5-flash-lite
- models/embedding-001
- models/text-embedding-004

Questions :
1. Quel modèle dans cette liste peut générer des images ?
2. Si aucun ne peut générer d'images, quelle est l'alternative recommandée ?
3. Le modèle gemini-2.5-flash-image-preview existe-t-il sur une autre version d'API ?

Merci de me donner une réponse technique précise.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    console.log('=== RÉPONSE DE GEMINI ===');
    console.log(response.text());
    console.log('========================');
    
  } catch (error) {
    console.log('Erreur:', error.message);
  }
}

askGeminiForHelp();
