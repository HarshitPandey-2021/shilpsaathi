// Diagnostic: trace the exact catalog pipeline for the problematic transcript
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const TRANSCRIPT = 'कारीगर द्वारा पारंपरिक तकनीक से तैयार किया गया हस्तशिल्प। लैपटॉप का वाटरप्रूफ बैग है जिसकी कीमत ₹1500 है';

console.log('=== CATALOG PIPELINE DIAGNOSTIC ===\n');
console.log('Input transcript:', TRANSCRIPT);
console.log();

// Import the voice service
const voiceService = await import('./src/services/voiceService.js');

// Step 1: Test Gemini directly
console.log('--- Step 1: Gemini ---');
try {
  const geminiResult = await voiceService.generateCatalogWithGemini(TRANSCRIPT, 'hi');
  console.log('Gemini result:', JSON.stringify(geminiResult, null, 2));
} catch (err) {
  console.log('Gemini ERROR:', err.message);
}
console.log();

// Step 2: Test OpenRouter directly
console.log('--- Step 2: OpenRouter ---');
try {
  const orResult = await voiceService.generateCatalogWithOpenRouter(TRANSCRIPT, 'hi');
  console.log('OpenRouter result:', JSON.stringify(orResult, null, 2));
} catch (err) {
  console.log('OpenRouter ERROR:', err.message);
}
console.log();

// Step 3: Test heuristic directly
console.log('--- Step 3: Heuristic Fallback ---');
try {
  const heurResult = voiceService.extractCatalogHeuristic(TRANSCRIPT, 'hi');
  console.log('Heuristic result:', JSON.stringify(heurResult, null, 2));
} catch (err) {
  console.log('Heuristic ERROR:', err.message);
}
console.log();

// Step 4: Full pipeline
console.log('--- Step 4: Full Pipeline (extractCatalogFromText) ---');
try {
  const fullResult = await voiceService.extractCatalogFromText(TRANSCRIPT, 'hi');
  console.log('Full pipeline result:', JSON.stringify(fullResult, null, 2));
} catch (err) {
  console.log('Full pipeline ERROR:', err.message);
}
console.log();

// Step 5: Full processVoiceAudio with direct transcript
console.log('--- Step 5: processVoiceAudio (directTranscript) ---');
try {
  const audioResult = await voiceService.processVoiceAudio({
    directTranscript: TRANSCRIPT,
    language: 'hi'
  });
  console.log('processVoiceAudio result:');
  console.log('  transcript:', audioResult.transcript);
  console.log('  source:', audioResult.source);
  console.log('  catalog.name:', audioResult.catalog?.name);
  console.log('  catalog.category:', audioResult.catalog?.category);
  console.log('  catalog.material:', audioResult.catalog?.material);
  console.log('  catalog.colour:', audioResult.catalog?.colour);
  console.log('  catalog.final_price:', audioResult.catalog?.final_price);
  console.log('  catalog.description_en:', audioResult.catalog?.description_en);
} catch (err) {
  console.log('processVoiceAudio ERROR:', err.message);
}