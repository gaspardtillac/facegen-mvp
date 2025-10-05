const { GoogleGenAI } = require('@google/genai');

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testImageGeneration() {
  try {
    const models = [
      'gemini-2.0-flash-exp',
      'gemini-1.5-flash',
      'gemini-1.5-pro'
    ];
    
    for (const modelName of models) {
      console.log(`\nTesting model: ${modelName}`);
      try {
        const result = await client.models.generateContent({
          model: modelName,
          contents: [{
            role: 'user',
            parts: [{ text: 'Generate a simple red circle image' }]
          }],
          generationConfig: {
            responseModalities: ['IMAGE']
          }
        });
        
        console.log('✓ Success with', modelName);
        console.log('Response has image:', !!result.candidates?.[0]?.content?.parts?.[0]?.inlineData);
      } catch (err) {
        console.log('✗ Failed with', modelName, ':', err.message);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testImageGeneration();
