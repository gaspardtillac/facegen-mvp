const { GoogleGenAI } = require('@google/genai');

async function testAlphaAPI() {
  try {
    const ai = new GoogleGenAI({
      apiKey: 'AIzaSyBZIvboNrX7K6CjDNxMok2mmAearvYb2KM',
      httpOptions: { apiVersion: "v1alpha" }
    });

    console.log('Test avec API v1alpha...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: "Create a simple portrait of a person in a cafe"
    });

    console.log('SUCCESS: API v1alpha fonctionne !');
    console.log('Response text:', response.text ? response.text().substring(0, 100) + '...' : 'Pas de texte');
    
    // Vérifier s'il y a une image
    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          console.log('IMAGE TROUVÉE ! Taille:', part.inlineData.data.length, 'caractères base64');
          return true;
        }
      }
    }
    
    console.log('Pas d\'image trouvée dans la réponse');
    
  } catch (error) {
    console.log('ERREUR avec API v1alpha:', error.message);
  }
}

testAlphaAPI();
