/**
 * Bhashini Speech-to-Text & AI Catalog Structuring Service
 * ShilpSaathi (शिल्पसाथी)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both local server and root workspace
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Public (non-secret) default ASR pipeline identifier in the Bhashini ULCA API.
 * Pipeline IDs are not credentials; they select a standard model pipeline and
 * can be overridden with BHASHINI_PIPELINE_ID for project-specific pipelines.
 */
const DEFAULT_BHASHINI_PIPELINE_ID = '64392f96daac500b55c543cd';

/**
 * Bhashini configuration is read ONLY from environment variables.
 *
 * SECURITY: No credential fallbacks are compiled into the source code. If the
 * required environment variables are missing, Bhashini ASR is skipped safely
 * and processing falls back to the heuristic catalog extractor. Credentials
 * are never echoed in logs or API responses.
 */
function getBhashiniConfig() {
  return {
    userId: (process.env.BHASHINI_USER_ID || '').trim(),
    apiKey: (process.env.BHASHINI_API_KEY || '').trim(),
    inferenceKey: (process.env.BHASHINI_INFERENCE_API_KEY || '').trim(),
    pipelineId: (process.env.BHASHINI_PIPELINE_ID || DEFAULT_BHASHINI_PIPELINE_ID).trim(),
    geminiKey: config.gemini.apiKey,
  };
}

// Standard craft knowledge base for fallback & heuristic entity extraction
const CRAFT_CATEGORIES = [
  { keywords: ['कागज़', 'कागज', 'पेपर', 'डायरी', 'नोटबुक', 'लिफाफा', 'paper', 'stationery', 'diary', 'journal', 'sheet', 'card', 'papier'], category: 'Handmade Home Decor', craft_type: 'Handmade Paper & Stationery Craft', default_mat: 'Organic Plant Fiber & Recycled Cotton Pulp' },
  { keywords: ['बांस', 'बाँस', 'केन', 'टोकरी', 'टोकरि', 'जूट', 'चटाई', 'रस्सी', 'bamboo', 'baans', 'cane', 'jute', 'basket', 'tokri', 'mat'], category: 'Handmade Home Decor', craft_type: 'Natural Bamboo & Cane Weaving', default_mat: 'Seasoned Bamboo & Natural Jute Fiber' },
  { keywords: ['मिट्टी', 'मिट्टी', 'घड़ा', 'कुल्हड़', 'दीया', 'बर्तन', 'गमला', 'मटका', 'सुराही', 'mitti', 'kulhad', 'diya', 'matka', 'terracotta', 'clay', 'pottery', 'vase'], category: 'Clay & Terracotta', craft_type: 'Wheel Pottery / Terracotta Sculpting', default_mat: 'Natural Riverbed Clay' },
  { keywords: ['कपड़ा', 'साड़ी', 'दुपट्टा', 'शॉल', 'धागा', 'बुनाई', 'खादी', 'सूट', 'cotton', 'silk', 'handloom', 'runner', 'textile', 'weaving'], category: 'Textiles & Handloom', craft_type: 'Traditional Handloom Weaving', default_mat: 'Organic Cotton / Silk' },
  { keywords: ['लकड़ी', 'काष्ठ', 'नक्काशी', 'खिलौना', 'संदूक', 'डिब्बा', 'wood', 'wooden', 'carved', 'sheesham', 'teak'], category: 'Woodcraft', craft_type: 'Hand Carving & Inlay', default_mat: 'Seasoned Sheesham / Teak Wood' },
  { keywords: ['पीतल', 'तांबा', 'धातु', 'घंटी', 'ढोकरा', 'मूर्ति', 'brass', 'copper', 'dhokra', 'metal', 'bronze'], category: 'Metalcraft', craft_type: 'Dhokra Lost-Wax / Metal Casting', default_mat: 'Brass & Bell Metal' },
  { keywords: ['मधुबनी', 'पेंटिंग', 'चित्रकला', 'कलमकारी', 'वारली', 'पटचित्र', 'painting', 'madhubani', 'warli', 'kalamkari', 'art'], category: 'Folk Art & Paintings', craft_type: 'Madhubani / Folk Painting', default_mat: 'Handmade Canvas & Natural Pigments' },
      { keywords: ['चमड़ा', 'जूती', 'बटुआ', 'मोजड़ी', 'leather', 'mojari', 'jooti'], category: 'Leather Craft', craft_type: 'Handcrafted Traditional Leatherwork', default_mat: 'Vegetable-Tanned Genuine Leather' },
  { keywords: ['बैग', 'बैग', 'बटुआ', 'हैंडबैग', 'झोला', 'पर्स', 'बैकपैक', 'tote', 'backpack', 'handbag', 'wallet', 'purse', 'bag'], category: 'Bags & Accessories', craft_type: 'Handcrafted Bag & Accessory Making', default_mat: 'Not clearly identifiable' },
  { keywords: ['पत्थर', 'संगमरमर', 'stone', 'marble', 'sculpture'], category: 'Stone Carving', craft_type: 'Intricate Stone Inlay / Carving', default_mat: 'Natural Marble / Soapstone' }
];

const ITEM_NOUNS = [
  { en: 'Handmade Paper Sheet / Stationery', hi: 'हस्तनिर्मित कागज़ / स्टेशनरी', keys: ['कागज़', 'कागज', 'पेपर', 'डायरी', 'नोटबुक', 'लिखने', 'paper', 'sheet', 'diary', 'journal', 'stationery', 'card'] },
  { en: 'Bamboo Basket', hi: 'बाँस की टोकरी', keys: ['basket', 'tokri', 'टोकरी', 'टोकरि'] },
  { en: 'Kulhad / Earthen Cup', hi: 'कुल्हड़', keys: ['kulhad', 'कुल्हड़', 'कुल्हर'] },
  { en: 'Matka / Earthen Pot', hi: 'मटका', keys: ['matka', 'मटका'] },
  { en: 'Vase / Pot', hi: 'फूलदान / घड़ा', keys: ['vase', 'pot', 'surahi', 'flower pot', 'फूलदान', 'सुराही', 'घड़ा', 'मटका', 'कुल्हड़', 'गमला'] },
  { en: 'Decorative Plate', hi: 'सजावटी थाली', keys: ['plate', 'wall plate', 'thali', 'थाल', 'थाली', 'प्लेट'] },
  { en: 'Diya / Oil Lamp', hi: 'दीया / दीपक', keys: ['diya', 'lamp', 'deepak', 'deep', 'दीया', 'दीपक', 'दीवे'] },
  { en: 'Statue / Idol', hi: 'मूर्ति / प्रतिमा', keys: ['statue', 'idol', 'figurine', 'murti', 'मूर्ति', 'प्रतिमा'] },
  { en: 'Table Runner', hi: 'टेबल रनर', keys: ['runner', 'table runner', 'रनर'] },
  { en: 'Saree', hi: 'साड़ी', keys: ['saree', 'sari', 'साड़ी'] },
  { en: 'Dupatta / Stole', hi: 'दुपट्टा / शॉल', keys: ['dupatta', 'stole', 'shawl', 'दुपट्टा', 'शॉल', 'ओढ़नी'] },
  { en: 'Jewelry / Necklace', hi: 'गहने / हार', keys: ['necklace', 'jewelry', 'jewellery', 'bangle', 'earring', 'हार', 'गहने', 'झुमका', 'कंगन'] },
  { en: 'Box / Chest', hi: 'डिब्बा / संदूक', keys: ['box', 'casket', 'chest', 'डिब्बा', 'संदूक', 'बाल्टी'] },
  { en: 'Wall Hanging / Art', hi: 'दीवार चित्र / हैंगिंग', keys: ['wall hanging', 'hanging', 'painting', 'art', 'पेंटिंग', 'चित्रकला'] },
  { en: 'Handbag / Tote', hi: 'हैंडबैग / झोला', keys: ['bag', 'handbag', 'tote', 'wallet', 'बैग', 'झोला', 'बटुआ'] },
  { en: 'Toy / Showpiece', hi: 'खिलौना / शोपीस', keys: ['toy', 'showpiece', 'puppet', 'खिलौना', 'कठपुतली'] }
];

const CRAFT_TECHNIQUES = [
  { en: 'Handmade Paper Craft', hi: 'हस्तनिर्मित कागज़ निर्माण', keys: ['कागज़', 'कागज', 'पेपर', 'paper', 'stationery'] },
  { en: 'Madhubani Folk Art', hi: 'मधुबनी चित्रकला', keys: ['madhubani', 'mithila', 'मधुबनी', 'मिथिला'] },
  { en: 'Dhokra Lost-Wax Casting', hi: 'ढोकरा धातु ढलाई', keys: ['dhokra', 'dokra', 'lost-wax', 'ढोकरा'] },
  { en: 'Traditional Wheel Pottery', hi: 'पारंपरिक चाक कुम्हारी', keys: ['wheel', 'pottery', 'terracotta', 'चाक', 'कुम्हार', 'कुम्हार', 'kumhar', 'मिट्टी', 'mitti'] },
  { en: 'Handloom Weaving', hi: 'हथकरघा बुनाई', keys: ['handloom', 'woven', 'weave', 'khadi', 'हथकरघा', 'बुनाई', 'खादी'] },
  { en: 'Hand Carving & Inlay', hi: 'हस्त नक्काशी', keys: ['carved', 'carving', 'inlay', 'नक्काशी', 'खुदाई'] },
  { en: 'Block Printing', hi: 'ठप्पा छपाई (Block Print)', keys: ['block print', 'ajrakh', 'dabu', 'ब्लॉक प्रिंट', 'छपाई'] },
  { en: 'Warli Folk Painting', hi: 'वारली पेंटिंग', keys: ['warli', 'वारली'] },
  { en: 'Kalamkari Art', hi: 'कलमकारी कला', keys: ['kalamkari', 'कलमकारी'] }
];

const MATERIALS_MAP = [
  { en: 'Organic Plant Fiber & Handmade Paper', hi: 'प्राकृतिक वनस्पति रेशा व हस्तनिर्मित कागज़', keys: ['कागज़', 'कागज', 'पेपर', 'रद्दी', 'पल्प', 'paper', 'pulp'] },
  { en: 'Bamboo', hi: 'बाँस', keys: ['बांस', 'बाँस', 'bamboo', 'baans'] },
  { en: 'Clay / Mitti', hi: 'मिट्टी', keys: ['terracotta', 'clay', 'mud', 'earthen', 'मिट्टी', 'टेराकोटा', 'mitti'] },
  { en: 'Pure Brass & Bell Metal', hi: 'शुद्ध पीतल एवं धातु', keys: ['brass', 'bronze', 'bell metal', 'metal', 'copper', 'पीतल', 'तांबा', 'धातु'] },
  { en: 'Organic Handloom Cotton', hi: 'हथकरघा सूती धागा', keys: ['cotton', 'khadi', 'सूती', 'कपास', 'खादी'] },
  { en: 'Pure Mulberry Silk', hi: 'शुद्ध रेशम', keys: ['silk', 'tussar', 'chanderi', 'रेशम', 'सिल्क'] },
  { en: 'Seasoned Sheesham / Teak Wood', hi: 'शीशम / सागवान की लकड़ी', keys: ['wood', 'wooden', 'sheesham', 'teak', 'लकड़ी', 'काष्ठ'] },
    { en: 'Vegetable-Tanned Genuine Leather', hi: 'प्राकृतिक चमड़ा', keys: ['leather', 'hide', 'चमड़ा'] },
  { en: 'Nylon & Synthetic Fabric', hi: 'नायलॉन और सिंथेटिक फैब्रिक', keys: ['nylon', 'synthetic', 'polyester', 'fabric', 'नायलॉन', 'सिंथेटिक', 'पॉलीएस्टर', 'फैब्रिक'] },
  { en: 'Natural Marble & Stone', hi: 'प्राकृतिक संगमरमर व पत्थर', keys: ['stone', 'marble', 'पत्थर', 'संगमरमर'] }
];

const COLORS_MAP = [
  { en: 'Natural Off-White / Parchment', keys: ['कागज़', 'सफेद', 'सफ़ेद', 'white', 'cream', 'off-white'] },
  { en: 'Terracotta Red', keys: ['red', 'laal', 'terracotta', 'लाल', 'गेरुआ'] },
  { en: 'Indigo Blue', keys: ['blue', 'indigo', 'नीला', 'आसमानी'] },
  { en: 'Mustard Yellow', keys: ['yellow', 'mustard', 'ochre', 'पीला', 'हल्दी'] },
  { en: 'Forest Green', keys: ['green', 'forest', 'हरा', 'धनी'] },
  { en: 'Golden Brass', keys: ['golden', 'gold', 'brass', 'सुनहरा', 'गोल्डन'] },
  { en: 'Natural Ochre & White', keys: ['ochre', 'क्रीम'] },
  { en: 'Charcoal Black', keys: ['black', 'charcoal', 'काला'] }
  ,{ en: 'Light Brown', keys: ['light brown', 'halka bhura', 'हल्का भूरा'] }
  ,{ en: 'Brown', keys: ['brown', 'bhura', 'भूरा', 'भूरे', 'भूरी'] }
  ,{ en: 'Natural', keys: ['natural', 'प्राकृतिक', 'कुदरती'] }
];

const HINDI_NUMBER_WORDS = {
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'छह': 6, 'छः': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'तेरह': 13, 'चौदह': 14, 'पंद्रह': 15, 'सोलह': 16, 'सत्रह': 17, 'अठारह': 18, 'उन्नीस': 19, 'बीस': 20,
  'इक्कीस': 21, 'बाईस': 22, 'तेईस': 23, 'चौबीस': 24, 'पच्चीस': 25, 'छब्बीस': 26, 'सत्ताईस': 27, 'अट्ठाईस': 28, 'उनतीस': 29, 'तीस': 30,
  'पैंतीस': 35, 'चालीस': 40, 'पैंतालीस': 45, 'पचास': 50, 'साठ': 60, 'सत्तर': 70, 'अस्सी': 80, 'नब्बे': 90, 'सौ': 100,
  'डेढ़': 1.5, 'ढाई': 2.5, 'हज़ार': 1000, 'हजार': 1000,
  'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'fifteen': 15, 'twenty': 20, 'twenty-five': 25, 'thirty': 30, 'forty': 40, 'fifty': 50, 'hundred': 100
};

/**
 * Extract numbers from text (supports digits and Hindi/English number words)
 */
function extractQuantity(text, contextKeywords = []) {
  const words = text.toLowerCase().split(/\s+/);
  
  // 1. Direct Regex for digits followed by context keywords
  for (const kw of contextKeywords) {
    const regex = new RegExp(`(?:${kw})\\s*[:=]?\\s*(\\d+)|(\\d+)\\s*(?:${kw})`, 'i');
    const match = text.match(regex);
    if (match) {
      return parseInt(match[1] || match[2], 10);
    }
  }

  // 2. Hindi word lookup near context keywords
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^a-zA-Z\u0900-\u097F]/g, '');
    if (contextKeywords.some(kw => words.slice(Math.max(0, i - 2), i + 3).some(w => w.includes(kw)))) {
      if (HINDI_NUMBER_WORDS[word]) {
        let val = HINDI_NUMBER_WORDS[word];
        // Check for compound numbers e.g. "दो सौ" (2 * 100 = 200)
        const nextWord = words[i + 1]?.replace(/[^a-zA-Z\u0900-\u097F]/g, '');
        if (nextWord && (nextWord === 'सौ' || nextWord === 'hundred')) {
          val = val * 100;
        } else if (nextWord && (nextWord === 'हज़ार' || nextWord === 'हजार' || nextWord === 'thousand')) {
          val = val * 1000;
        }
        return val;
      }
    }
  }

  return null;
}

/**
 * Transcribe audio using Bhashini ULCA / Dhruva ASR API
 */
export async function transcribeWithBhashini(audioBuffer, rawLanguage = 'hi', mimeType = 'audio/webm') {
  const bhashini = getBhashiniConfig();
  if (!bhashini.userId || !bhashini.apiKey) {
    console.warn('[Bhashini] Credentials not configured. Skipping Bhashini ASR and proceeding to fallback.');
    return null;
  }

  // Normalize language codes (e.g., 'hi-IN' -> 'hi', 'en-IN' -> 'en')
  const language = (rawLanguage || 'hi').split('-')[0].toLowerCase();

  try {
    console.log(`[Bhashini] Initiating ASR transcription for language: ${language} (raw: ${rawLanguage}, pipeline: ${bhashini.pipelineId})...`);
    
    const pipelinePayload = {
      pipelineTasks: [
        {
          taskType: 'asr',
          config: {
            language: { sourceLanguage: language }
          }
        }
      ],
      pipelineRequestConfig: {
        pipelineId: bhashini.pipelineId
      }
    };

    let configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userID': bhashini.userId,
        'ulcaApiKey': bhashini.apiKey
      },
      body: JSON.stringify(pipelinePayload)
    });

    // If initial query failed with 400, retry with default verified pipeline ID
    if (!configRes.ok && bhashini.pipelineId !== DEFAULT_BHASHINI_PIPELINE_ID) {
      pipelinePayload.pipelineRequestConfig.pipelineId = DEFAULT_BHASHINI_PIPELINE_ID;
      configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userID': bhashini.userId,
          'ulcaApiKey': bhashini.apiKey
        },
        body: JSON.stringify(pipelinePayload)
      });
    }

    if (!configRes.ok) {
      const errText = await configRes.text().catch(() => '');
      const classification = classifyError(configRes.status, errText);
      console.error(`[Bhashini] ${classification.label} — pipeline config failed (HTTP ${configRes.status}). Falling back to STT fallback.`);
      return null;
    }

    const configData = await configRes.json();
    const asrCallbackUrl = configData?.pipelineInferenceAPIEndPoint?.callbackUrl;
    const headerName = configData?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.name || 'Authorization';
    const asrInferenceKey = configData?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || bhashini.inferenceKey;
    const serviceId = configData?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;

    if (!asrCallbackUrl || !serviceId) {
      console.warn('[Bhashini] Incomplete pipeline endpoints from Bhashini ULCA response. Falling back to STT fallback.');
      return null;
    }

    if (!asrInferenceKey) {
      console.warn('[Bhashini] Bhashini inference API key is missing. Skipping Bhashini ASR.');
      return null;
    }

    const base64Audio = audioBuffer.toString('base64');

    // Step 2: Compute Inference with Bhashini Dhruva Conformer Model
    const inferenceHeaders = {
      'Content-Type': 'application/json',
    };
    inferenceHeaders[headerName] = asrInferenceKey;

    const computeRes = await fetch(asrCallbackUrl, {
      method: 'POST',
      headers: inferenceHeaders,
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'asr',
            config: {
              language: { sourceLanguage: language },
              serviceId: serviceId,
              audioFormat: 'wav',
              samplingRate: 16000
            }
          }
        ],
        inputData: {
          audio: [{ audioContent: base64Audio }]
        }
      })
    });

    if (!computeRes.ok) {
      const errText = await computeRes.text().catch(() => '');
      const classification = classifyError(computeRes.status, errText);
      console.error(`[Bhashini] ${classification.label} — inference failed (HTTP ${computeRes.status}). Falling back.`);
      return null;
    }

    const computeData = await computeRes.json();
    const transcript = computeData?.pipelineResponse?.[0]?.output?.[0]?.source;
    if (transcript && transcript.trim()) {
      console.log('[Bhashini] ✅ Transcription successful:', transcript.trim());
      return transcript.trim();
    }
  } catch (err) {
    const classification = classifyError(0, err.message, err.name);
    console.error(`[Bhashini] ${classification.label} — error: ${err.message}. Falling back.`);
  }

  return null;
}

/**
 * Transcribe audio using OpenRouter (OpenAI-compatible audio transcription
 * endpoint). Serves as the second-stage fallback when Bhashini ASR does not
 * yield a transcript.
 *
 * Endpoint: POST https://openrouter.ai/api/v1/audio/transcriptions
 *
 * @param {Buffer} audioBuffer - Raw audio bytes.
 * @param {string} mimeType   - Audio MIME type (e.g. 'audio/webm').
 * @returns {Promise<string|null>} Transcribed text, or null on any failure.
 */
export async function transcribeWithOpenRouter(audioBuffer, mimeType = 'audio/webm') {
  if (!config.openrouter?.enabled || !config.openrouter?.apiKey) {
    console.warn('[OpenRouter] Not configured. Skipping OpenRouter STT fallback.');
    return null;
  }

  const controller = new AbortController();
  const timeoutMs = config.openrouter.timeoutMs || 45000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[OpenRouter] Initiating STT transcription (model: ${config.openrouter.sttModel})...`);

    // Derive a file extension from the MIME type for the multipart payload.
    const ext = (mimeType.split('/')[1] || 'webm').split(';')[0];
    const form = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType });
    form.append('file', blob, `audio.${ext}`);
    form.append('model', config.openrouter.sttModel);

    const res = await fetch('https://openrouter.ai/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.openrouter.apiKey}`,
        'HTTP-Referer': config.openrouter.referer || 'http://localhost:5000',
        'X-Title': config.openrouter.title || 'ShilpSaathi',
      },
      body: form,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let errText = '';
      try { errText = await res.text(); } catch { /* ignore */ }
      // Redact any leaked credentials before logging.
      const safeErr = errText.replace(/Bearer\s+[^\s]+/gi, 'Bearer REDACTED').slice(0, 200);
      const classification = classifyError(res.status, safeErr);
      console.error(`[OpenRouter] ${classification.label} — STT failed (HTTP ${res.status}): ${safeErr}`);
      return null;
    }

    let data = null;
    try { data = await res.json(); } catch {
      console.error('[OpenRouter] Malformed JSON in transcription response.');
      return null;
    }

    const transcript = (data?.text || '').trim();
    if (transcript) {
      console.log('[OpenRouter] ✅ Transcription successful:', transcript);
      return transcript;
    }

    console.warn('[OpenRouter] Empty transcription returned by model.');
    return null;
  } catch (err) {
    clearTimeout(timeoutId);
    const classification = classifyError(0, err.message, err.name);
    console.error(`[OpenRouter] ${classification.label} — error: ${err.message}`);
    return null;
  }
}

import { callLlmWithFallback, classifyError } from './llmService.js';

/**
 * Builds the structured-catalog extraction prompt shared across LLM providers.
 */
export function buildCatalogPrompt(text, sourceLanguage = 'hi', targetLanguage = 'en') {
  const langNames = {
    hi: 'Hindi',
    en: 'English',
    bn: 'Bengali',
    ta: 'Tamil',
    te: 'Telugu',
    mr: 'Marathi',
  };
  const sourceLangCode = (sourceLanguage || 'hi').split('-')[0].toLowerCase();
  const targetLangCode = (targetLanguage || 'en').split('-')[0].toLowerCase();
  const sourceLangName = langNames[sourceLangCode] || 'Hindi';
  const targetLangName = langNames[targetLangCode] || 'English';

  return `You are an expert AI e-commerce cataloger and copywriter for ShilpSaathi, an initiative supporting marginalized traditional Indian artisans.

An artisan has described their handcrafted item using voice.
Your task is to transform their spoken note into a professional, high-converting e-commerce product listing while strictly preserving their stated facts.

Artisan Spoken Note: "${text}"
Artisan's Spoken Language: ${sourceLangName} (${sourceLangCode})
Secondary Marketing Language: ${targetLangName} (${targetLangCode})

Allowed Product Categories:
- Clay & Terracotta
- Textiles & Handloom
- Woodcraft
- Metalcraft
- Folk Art & Paintings
- Leather Craft
- Stone Carving
- Handmade Home Decor
- Bags & Accessories

TASK & REQUIREMENTS:
1. "productName": A short, authentic, marketable product title in ${sourceLangName} (e.g. "हस्तनिर्मित पीतल का दीया", "हाथ से बना टेराकोटा फूलदान", "Handcrafted Sheesham Wood Box").
2. "category": Pick the single most accurate category from Allowed Product Categories (infer from material/noun context, do not leave blank).
3. "colour": The primary colour(s). If no specific color is mentioned, infer an authentic tone like "Natural", "Terracotta Red", "Natural Ochre", or "Golden Brass" (never output "—" or "Not clearly identifiable").
4. "material": The craft material (e.g. "Natural Clay", "Pure Brass", "Sheesham Wood", "Organic Cotton", "Bamboo Fiber").
5. "craft_type": The traditional technique (e.g. "Dhokra Metal Casting", "Potter's Wheel", "Handloom Weaving", "Wood Inlay", "Handmade Paper Craft").
6. "descriptionLocal": A polished, captivating e-commerce marketing description in ${sourceLangName}. Do NOT paste the raw transcript verbatim. Highlight authentic handcrafted quality, cultural value, and any stated facts (time, materials, craft method) in a natural marketing style.
7. "descriptionEnglish": An equally polished, high-converting e-commerce marketing description in ${targetLangName}.
8. "keywords": An array of 5-8 SEO keywords in English (e.g. ["handmade brass diya", "traditional home decor", "indian handicraft"]).
9. "extractedFacts": Extract time and cost numbers from the speech:
   - "laborHours": Number of labor hours (parse digit or spelled-out words like "do ghante" -> 2, "char ghante" -> 4). Default 4 if unstated.
   - "materialCostINR": Raw material cost in ₹ INR (parse "do sau rupaye" -> 200, "₹350" -> 350). Default 150 if unstated.
   - "explicitPrice": Selling price explicitly stated by artisan in ₹ INR, or null if none stated.

Return ONLY a valid JSON object matching this exact schema:
{
  "productName": "string",
  "category": "string",
  "colour": "string",
  "material": "string",
  "craft_type": "string",
  "descriptionLocal": "string",
  "descriptionEnglish": "string",
  "keywords": ["string"],
  "extractedFacts": {
    "laborHours": 4,
    "materialCostINR": 200,
    "explicitPrice": null
  }
}`;
}

/**
 * Normalizes a parsed LLM catalog response into the standard schema.
 */
function normalizeCatalog(parsed, rawText = '') {
  if (!parsed || typeof parsed !== 'object') return null;

  const facts = parsed.extractedFacts || {};
  const laborHours = Number(facts.laborHours ?? parsed.hours_spent ?? parsed.estimated_labor_hours ?? 4);
  const matCost = Number(facts.materialCostINR ?? parsed.raw_material_cost ?? parsed.estimated_material_cost ?? 150);
  const explicitPrice = facts.explicitPrice !== undefined && facts.explicitPrice !== null ? Number(facts.explicitPrice) : (parsed.explicit_price ?? null);

  const title = (parsed.productName || parsed.name || '').trim();
  const cat = (parsed.category || '').trim();
  const mat = (parsed.material && parsed.material !== 'Not clearly identifiable' ? parsed.material : '').trim();
  const col = (parsed.colour && parsed.colour !== 'Not clearly identifiable' ? parsed.colour : '').trim();
  const descLoc = (parsed.descriptionLocal || parsed.description_hi || '').trim();
  const descEn = (parsed.descriptionEnglish || parsed.description_en || '').trim();
  const keywords = Array.isArray(parsed.keywords) ? parsed.keywords.filter(Boolean) : [];

  return {
    name: title,
    category: cat || 'Handmade Home Decor',
    material: mat || 'Natural Craft Material',
    colour: col || 'Natural',
    craft_type: parsed.craft_type || '',
    description_hi: descLoc,
    description_en: descEn,
    description_local: descLoc,
    keywords: keywords.length ? keywords : ['handmade', 'handicraft'],
    extracted_facts: {
      labor_hours: laborHours,
      material_cost_inr: matCost,
      explicit_price: explicitPrice,
    },
    raw_material_cost: matCost,
    estimated_material_cost: matCost,
    hours_spent: laborHours,
    estimated_labor_hours: laborHours,
    explicit_price: explicitPrice,
    spoken_transcript: rawText,
  };
}

/**
 * Extract structured catalog from raw spoken description using AI / NLP heuristics
 */
export async function extractCatalogFromText(rawText, sourceLanguage = 'hi', targetLanguage = 'en') {
  const text = (rawText || '').trim();
  let aiCatalog = null;
  let llmProvider = 'none';

  // 1. Try Resilient Multi-Provider LLM: Gemini -> Groq
  if (text.length > 3) {
    const prompt = buildCatalogPrompt(text, sourceLanguage, targetLanguage);
    console.log('[AI Catalog] Invoking LLM extraction with Gemini -> Groq fallback chain...');
    
    const llmRes = await callLlmWithFallback(prompt, { temperature: 0.3 });
    if (llmRes.success && llmRes.data) {
      aiCatalog = normalizeCatalog(llmRes.data, text);
      llmProvider = llmRes.provider;
      console.log(`[AI Catalog] ✅ Structured catalog successfully generated by ${llmProvider}.`);
    }
  }

  // Intelligent craft entity heuristic extraction engine
  console.log('[AI Catalog] Using intelligent craft heuristic catalog extraction on text:', text);
  
  const lower = text.toLowerCase();

  // Match complete words or phrases without treating substrings as facts.
  const wordMatch = (k) => {
    const kw = k.toLowerCase();
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
    return new RegExp(`(?:^|[^a-z0-9\u0900-\u097F])${escaped}(?:$|[^a-z0-9\u0900-\u097F])`, 'iu').test(lower);
  };

  const cleanPhrase = (str) => {
    if (!str) return '';
    return str.replace(/^[^\w\u0900-\u097F]+|[^\w\u0900-\u097F]+$/g, '').trim();
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  // 1. Dynamic Extraction of Explicit Material
  let explicitMaterial = null;
  const matRegex1 = /(?:ise\s+|ye\s+|yeh\s+|यह\s+|इसे\s+)?([a-z0-9\u0900-\u097F\s]{2,30}?)\s+(?:se\s+(?:haath\s+se\s+)?ban(?:a|i|e)(?:ya\s+gaya|\s+hua|\s+hui|\s+hue)?|से\s+(?:हाथ\s+से\s+)?बन(?:ा|ी|े)(?:या\s+गया|\s+हुआ|\s+हुई|\s+हुए)?|se\s+nirmit|se\s+taiyar|made\s+of|made\s+from|crafted\s+from)/i;
  const mMatch1 = text.match(matRegex1);
  if (mMatch1) {
    let cand = cleanPhrase(mMatch1[1]);
    cand = cand.replace(/^(?:ek|ye|yeh|ise|kisi|एक|यह|इसे)\s+/i, '').trim();
    const stopWords = ['haath', 'haath se', 'ek', 'yeh', 'ye', 'kisi', 'kareegar', 'kareegaro', 'taknik', 'taknik se', 'paramparik taknik', 'paramparik', 'पारंपरिक तकनीक', 'पारंपरिक', 'तकनीक', 'तकनीक से', 'technique', 'technique se', 'traditional technique', 'traditional', 'हाथ', 'एक', 'यह'];
    if (cand && !stopWords.includes(cand.toLowerCase())) {
      explicitMaterial = cand;
    }
  }

  if (!explicitMaterial) {
    const matRegex2 = /(?:ye\s+ek\s+|yeh\s+ek\s+|ye\s+|yeh\s+|यह\s+एक\s+|यह\s+)([a-z0-9\u0900-\u097F]{2,20}?)\s+(?:ka|ki|ke|का|की|के)\s+([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+jise|\s+ise)/i;
    const mMatch2 = text.match(matRegex2);
    if (mMatch2) {
      explicitMaterial = cleanPhrase(mMatch2[1]);
    }
  }

  let matchedMaterial = null;
  if (explicitMaterial) {
    matchedMaterial = MATERIALS_MAP.find(m => m.keys.some(k => k.toLowerCase() === explicitMaterial.toLowerCase() || explicitMaterial.toLowerCase().includes(k.toLowerCase())));
  }
  if (!matchedMaterial) {
    matchedMaterial = MATERIALS_MAP.find(m => m.keys.some(k => wordMatch(k)));
  }

  let finalMaterial = 'Not clearly identifiable';
  if (matchedMaterial) {
    finalMaterial = matchedMaterial.en;
  } else if (explicitMaterial) {
    const exLower = explicitMaterial.toLowerCase();
    if (exLower.includes('narial') || exLower.includes('नारियल') || exLower.includes('coconut')) {
      finalMaterial = 'Coconut Shell';
    } else {
      finalMaterial = toTitleCase(explicitMaterial);
    }
  } else if (aiCatalog?.material && aiCatalog.material !== 'Not clearly identifiable') {
    finalMaterial = aiCatalog.material;
  }

  // 2. Dynamic Extraction of Item Noun & Product Title
  let explicitItem = null;
  const itemRegex1 = /(?:se\s+(?:haath\s+se\s+)?ban(?:a|i|e)(?:ya\s+gaya|\s+hua|\s+hui|\s+hue)?|से\s+(?:हाथ\s+से\s+)?बन(?:ा|ी|े)(?:या\s+गया|\s+हुआ|\s+हुई|\s+हुए)?)\s+([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+iska|\s+iski|\s+इसका|\s+इसकी|\s+aur|\s+और|\s+natural|\s+rang|\s+रंग)/i;
  const iMatch1 = text.match(itemRegex1);
  if (iMatch1) {
    let cand = cleanPhrase(iMatch1[1]);
    cand = cand.replace(/^(?:ek|ye|yeh|ise|एक|यह|इसे)\s+/i, '').trim();
    const stopWords = ['hua', 'hui', 'hue', 'gaya', 'hai', 'item', 'हुआ', 'हुई', 'हुए', 'गया', 'है'];
    if (cand && !stopWords.includes(cand.toLowerCase())) {
      explicitItem = cand;
    }
  }

  if (!explicitItem) {
    const itemRegex2 = /(?:ye\s+ek\s+|yeh\s+ek\s+|ye\s+|yeh\s+|यह\s+एक\s+|यह\s+)(?:[a-z0-9\u0900-\u097F]+\s+(?:ka|ki|ke|का|की|के)\s+)?([a-z0-9\u0900-\u097F\s]{2,25}?)(?:\s+hai|\s+है|\s*,|\s*\.|\s+jise|\s+ise|\s+जिसे|\s+इसे)/i;
    const iMatch2 = text.match(itemRegex2);
    if (iMatch2) {
      let cand = cleanPhrase(iMatch2[1]);
      cand = cand.replace(/^(?:ek|ye|yeh|ise|handmade|handcrafted|हस्तनिर्मित|हाथ से बना)\s+/i, '').trim();
      if (cand && cand.toLowerCase() !== explicitMaterial?.toLowerCase()) {
        explicitItem = cand;
      }
    }
  }

  let matchedNoun = ITEM_NOUNS.find(n => n.keys.some(k => wordMatch(k)));

  let finalTitle = 'Handcrafted Craft Item';
  if (matchedNoun) {
    const nounEn = matchedNoun.en.split('/')[0].trim();
    if (nounEn.toLowerCase().includes('kulhad')) {
      finalTitle = 'Handcrafted Kulhad';
    } else if (nounEn.toLowerCase().includes('basket') || nounEn.toLowerCase().includes('tokri')) {
      finalTitle = (finalMaterial !== 'Not clearly identifiable' && !nounEn.toLowerCase().includes(finalMaterial.toLowerCase()))
        ? `Handcrafted ${finalMaterial} ${nounEn.replace(/bamboo\s+/i, '')}`
        : `Handcrafted ${nounEn}`;
    } else {
      finalTitle = `Handcrafted ${nounEn}`;
    }
  } else if (explicitItem) {
    const cleanItem = explicitItem.replace(/^(?:handmade|handcrafted|हस्तनिर्मित)\s+/i, '').trim();
    const itemTitle = toTitleCase(cleanItem);
    if (itemTitle.toLowerCase() === 'craft item' || itemTitle.toLowerCase() === 'item') {
      finalTitle = 'Handcrafted Craft Item';
    } else {
      finalTitle = (finalMaterial !== 'Not clearly identifiable' && !itemTitle.toLowerCase().includes(finalMaterial.toLowerCase()))
        ? `Handcrafted ${finalMaterial} ${itemTitle}`
        : `Handcrafted ${itemTitle}`;
    }
  } else if (aiCatalog?.name && aiCatalog.name !== 'Craft Item' && aiCatalog.name !== 'Handcrafted Craft Item') {
    finalTitle = aiCatalog.name;
  }

  // 3. Technique
  let matchedTechnique = CRAFT_TECHNIQUES.find(t => t.keys.some(k => wordMatch(k)));
  const finalCraftType = matchedTechnique ? matchedTechnique.en : (aiCatalog?.craft_type || '');

  // 4. Category
  let detectedCategory = CRAFT_CATEGORIES.find(c => c.keywords.some(k => wordMatch(k)));
  let finalCategory = detectedCategory?.category;
  if (!finalCategory && aiCatalog?.category && aiCatalog.category !== 'Not clearly identifiable') {
    finalCategory = aiCatalog.category;
  }
  if (!finalCategory) {
    const matLower = finalMaterial.toLowerCase();
    const titleLower = finalTitle.toLowerCase();
    if (matLower.includes('clay') || matLower.includes('mitti') || titleLower.includes('kulhad') || titleLower.includes('pottery')) {
      finalCategory = 'Clay & Terracotta';
    } else if (matLower.includes('cotton') || matLower.includes('silk') || matLower.includes('wool') || titleLower.includes('saree')) {
      finalCategory = 'Textiles & Handloom';
    } else if (matLower.includes('wood') || matLower.includes('sheesham') || matLower.includes('teak')) {
      finalCategory = 'Woodcraft';
    } else if (matLower.includes('brass') || matLower.includes('metal') || matLower.includes('copper')) {
      finalCategory = 'Metalcraft';
    } else if (matLower.includes('leather')) {
      finalCategory = 'Leather Craft';
    } else if (matLower.includes('stone') || matLower.includes('marble')) {
      finalCategory = 'Stone Carving';
    } else if (matLower.includes('bamboo') || matLower.includes('cane') || matLower.includes('jute') || matLower.includes('paper') || titleLower.includes('basket') || titleLower.includes('pen stand')) {
      finalCategory = 'Handmade Home Decor';
    } else {
      finalCategory = 'Handmade Home Decor';
    }
  }

  // 5. Colors
  let explicitColor = null;
  const colRegex1 = /(?:iska\s+rang|rang|color|colour|रंग)\s*(?:hai\s+)?[:=]?\s*([a-z0-9\u0900-\u097F\s]{2,20}?)(?:\s+hai|\s+है|\s+aur|\s+और|\s*,|\s*\.|\s*$|\s+iski|\s+iska|\s+इसकी|\s+इसका)/i;
  const cMatch1 = text.match(colRegex1);
  if (cMatch1) {
    explicitColor = cleanPhrase(cMatch1[1]);
  } else {
    const colRegex2 = /(?:^|\s)([a-z0-9\u0900-\u097F]+)\s+(?:rang\s+me|rang\s+mein|रंग\s+में|color\s+me|colour\s+me)/i;
    const cMatch2 = text.match(colRegex2);
    if (cMatch2) {
      explicitColor = cleanPhrase(cMatch2[1]);
    }
  }

  let matchedColorEntries = COLORS_MAP.filter(c => c.keys.some(k => wordMatch(k) || (explicitColor && (k.toLowerCase() === explicitColor.toLowerCase() || explicitColor.toLowerCase().includes(k.toLowerCase())))));
  if (matchedColorEntries.some(m => m.en === 'Light Brown')) {
    matchedColorEntries = matchedColorEntries.filter(c => c.en !== 'Brown');
  }

  let finalColor = 'Not clearly identifiable';
  if (matchedColorEntries.length > 0) {
    finalColor = matchedColorEntries.map(c => c.en).join(' & ');
  } else if (explicitColor) {
    finalColor = toTitleCase(explicitColor);
  } else if (aiCatalog?.colour && aiCatalog.colour !== 'Not clearly identifiable') {
    finalColor = aiCatalog.colour;
  }

  // 6. Hours spent
  let hours = extractQuantity(text, ['hour', 'hr', 'ghante', 'घंटे', 'घंटा', 'दिन', 'day', 'समय']) || 4;
  hours = Math.min(40, Math.max(1, hours));

  // 7. Explicit Price / Cost
  const explicitCost = extractQuantity(text, ['₹', 'rs', 'rupee', 'रुपये', 'रुपया', 'rupaye', 'rupaya', 'लागत', 'cost', 'खर्च', 'कीमत', 'keemat']);
  let cost = explicitCost ?? 150;
  cost = explicitCost !== null
    ? Math.min(10000, Math.max(0, cost))
    : Math.min(10000, Math.max(10, cost));

  // 8. Bilingual Descriptions reflecting handcrafted value
  const cleanItemName = finalTitle.replace(/^Handcrafted\s+/i, '').trim();
  const descHi = text.length > 5
    ? `पारंपरिक तकनीक और कुशल हस्तशिल्प से तैयार किया गया प्रामाणिक ${cleanItemName || 'कलाकृति'}। 100% हस्तनिर्मित व टिकाऊ।`
    : 'कारीगर द्वारा शुद्ध पारंपरिक शिल्प विधि से निर्मित उत्कृष्ट कलाकृति। 100% हस्तनिर्मित।';

  const factParts = [
    finalMaterial !== 'Not clearly identifiable' ? `crafted from ${finalMaterial.toLowerCase()}` : null,
    matchedTechnique ? `using traditional ${matchedTechnique.en.toLowerCase()}` : 'by skilled artisans',
    finalColor !== 'Not clearly identifiable' ? `${finalColor.toLowerCase()} finish` : null,
    explicitCost !== null ? `with direct artisan valuation` : null,
  ].filter(Boolean);

  const descEn = factParts.length > 0
    ? `An authentic handcrafted ${cleanItemName || 'craft item'}, carefully made ${factParts.join(', ')}.`
    : (aiCatalog?.description_en || 'Authentic handcrafted heritage item made by traditional artisans.');

  const keywords = [
    'handmade',
    finalCategory.toLowerCase(),
    cleanItemName.toLowerCase(),
    finalMaterial !== 'Not clearly identifiable' ? finalMaterial.toLowerCase() : null,
    'indian handicraft',
    'authentic craft',
  ].filter(Boolean);

  // Helper: treat "Craft Item", "Handcrafted Craft Item", empty, null as invalid LLM name
  const isValidLlmName = (n) => n && n.trim() && !['craft item', 'handcrafted craft item', 'item', '—'].includes(n.trim().toLowerCase());
  const isValidLlmValue = (v) => v !== null && v !== undefined && String(v).trim() !== '' && String(v).trim() !== '—' && String(v).trim() !== 'Not clearly identifiable';

  const isAi = Boolean(aiCatalog && (aiCatalog.name || aiCatalog.description_hi || aiCatalog.description_en));

  const catalog = {
    ...aiCatalog,
    // Prefer LLM name when valid; fall back to heuristic title
    name: isValidLlmName(aiCatalog?.name) ? aiCatalog.name : (cleanItemName ? `Handcrafted ${cleanItemName}` : 'Handcrafted Heritage Craft'),
    // Prefer LLM category when valid; fall back to heuristic category
    category: isValidLlmValue(aiCatalog?.category) ? aiCatalog.category : (finalCategory || 'Handmade Home Decor'),
    // Prefer LLM craft_type when valid; fall back to heuristic
    craft_type: isValidLlmValue(aiCatalog?.craft_type) ? aiCatalog.craft_type : finalCraftType,
    // Prefer LLM material when valid; fall back to heuristic material
    material: isValidLlmValue(aiCatalog?.material) ? aiCatalog.material : (finalMaterial !== 'Not clearly identifiable' ? finalMaterial : 'Natural Craft Material'),
    // Prefer LLM colour when valid; fall back to heuristic colour
    colour: isValidLlmValue(aiCatalog?.colour) ? aiCatalog.colour : (finalColor !== 'Not clearly identifiable' ? finalColor : 'Natural Tone'),
    // Prefer LLM descriptions when valid; fall back to heuristic descriptions
    description_hi: isValidLlmValue(aiCatalog?.description_hi) ? aiCatalog.description_hi : descHi,
    description_en: isValidLlmValue(aiCatalog?.description_en) ? aiCatalog.description_en : descEn,
    description_local: isValidLlmValue(aiCatalog?.description_local || aiCatalog?.description_hi) ? (aiCatalog.description_local || aiCatalog.description_hi) : descHi,
    // Merge LLM keywords with heuristic keywords, preferring LLM as primary source
    keywords: [...new Set([
      ...(Array.isArray(aiCatalog?.keywords) && aiCatalog.keywords.length > 0 ? aiCatalog.keywords : keywords),
    ])],
    extracted_facts: aiCatalog?.extracted_facts || {
      labor_hours: hours,
      material_cost_inr: cost,
      explicit_price: explicitCost,
    },
    raw_material_cost: explicitCost !== null ? cost : Number(aiCatalog?.raw_material_cost ?? cost),
    hours_spent: Number(aiCatalog?.hours_spent ?? hours),
    estimated_material_cost: Number(aiCatalog?.raw_material_cost ?? cost),
    estimated_labor_hours: Number(aiCatalog?.hours_spent ?? hours),
    explicit_price: explicitCost,
    final_price: explicitCost !== null ? explicitCost : (aiCatalog?.final_price ?? cost),
    price_min: explicitCost !== null ? explicitCost : (aiCatalog?.price_min ?? cost),
    price_max: explicitCost !== null ? explicitCost : (aiCatalog?.price_max ?? cost),
    is_ai_generated: isAi,
    llm_provider: llmProvider || (isAi ? 'gemini' : 'none'),
    spoken_transcript: text,
  };

  return catalog;
}

/**
 * End-to-end voice processing: Takes audio buffer or transcript and produces full catalog
 */
export async function processVoiceAudio({ audioBuffer, mimeType = 'audio/wav', directTranscript = null, language = 'hi', targetLanguage = 'en' }) {
  let transcript = (directTranscript || '').trim();
  let source = directTranscript ? 'direct_speech_api' : 'unknown';

  if (!transcript && audioBuffer && audioBuffer.length > 100) {
    // Attempt Bhashini ASR (MeitY Government of India Conformer Model)
    const bhashiniText = await transcribeWithBhashini(audioBuffer, language, mimeType);
    if (bhashiniText) {
      transcript = bhashiniText;
      source = 'bhashini_asr';
    }
  }

  // Fallback: OpenRouter STT if Bhashini did not produce a transcript
  if (!transcript && audioBuffer && audioBuffer.length > 100 && config.openrouter.enabled) {
    const openRouterText = await transcribeWithOpenRouter(audioBuffer, mimeType);
    if (openRouterText) {
      transcript = openRouterText;
      source = 'openrouter_stt';
    }
  }

  // Generate structured catalog
  const catalog = await extractCatalogFromText(transcript || 'हस्तनिर्मित पारंपरिक भारतीय कलाकृति', language, targetLanguage);

  return {
    transcript,
    catalog,
    source
  };
}

