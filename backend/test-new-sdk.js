const { GoogleGenAI } = require('@google/genai');

async function testWithNewSDK() {
  try {
    const ai = new GoogleGenAI({
      apiKey: 'AIzaSyBZIvboNrX7K6CjDNxMok2mmAearvYb2KM'
    });

    console.log('Test avec le nouveau SDK @google/genai...');
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: "Create a simple portrait of a person"
    });

    console.log('SUCCESS: Le nouveau SDK fonctionne !');
    
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        console.log('Text response:', part.text.substring(0, 100) + '...');
      } else if (part.inlineData) {
        console.log('Image trouvée ! Taille:', part.inlineData.data.length, 'caractères base64');
      }
    }
    
  } catch (error) {
    console.log('ERREUR avec nouveau SDK:', error.message);
  }
}

testWithNewSDK();
