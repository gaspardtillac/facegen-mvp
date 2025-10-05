import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  try {
    console.log('Test de listModels...');
    const { models } = await genAI.listModels();
    console.log('Modèles disponibles supportant generateContent :');
    
    models.forEach(model => {
      if (model.supportedGenerationMethods?.includes('generateContent')) {
        console.log(`- ${model.name}`);
        if (model.name.includes('image') || model.name.includes('vision')) {
          console.log(`  -> MODÈLE IMAGE/VISION TROUVÉ !`);
        }
      }
    });
    
    // Test spécifique du modèle problématique
    console.log('\nTest du modèle gemini-2.5-flash-image-preview...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });
    await model.generateContent('test');
    console.log('SUCCESS: Le modèle gemini-2.5-flash-image-preview est accessible !');
    
  } catch (error) {
    console.error('Erreur détaillée:', error.message);
  }
}

checkModels();
