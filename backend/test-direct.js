const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyBZIvboNrX7K6CjDNxMok2mmAearvYb2KM');

async function testImageModel() {
  try {
    console.log('Test du modèle gemini-2.5-flash-image-preview...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    const result = await model.generateContent('Generate a simple image of a cat');
    console.log('SUCCESS: Le modèle répond !');
    console.log('Response:', result.response.text());
  } catch (error) {
    console.log('ERREUR:', error.message);
    if (error.message.includes('404')) {
      console.log('-> Le modèle n\'est pas accessible');
    } else if (error.message.includes('API key')) {
      console.log('-> Problème avec la clé API');
    }
  }
}

testImageModel();
