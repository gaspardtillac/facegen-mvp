const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBZIvboNrX7K6CjDNxMok2mmAearvYb2KM');

async function testFlashWithImage() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Simulons un appel avec image comme dans votre vraie app
    const imagePart = {
      inlineData: {
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', // pixel transparent
        mimeType: 'image/png'
      }
    };

    const textPart = {
      text: 'Analyze this image and create a detailed description for generating a professional portrait avatar'
    };

    console.log('Test de gemini-2.5-flash avec image en entrée...');
    const result = await model.generateContent([imagePart, textPart]);
    const response = await result.response;
    
    console.log('SUCCESS: gemini-2.5-flash peut traiter les images !');
    console.log('Réponse:', response.text().substring(0, 200) + '...');
    
  } catch (error) {
    console.log('ERREUR avec gemini-2.5-flash:', error.message);
  }
}

testFlashWithImage();
