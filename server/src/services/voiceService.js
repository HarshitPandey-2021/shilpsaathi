/**
 * Bhashini Speech-to-Text & AI Catalog Structuring Service
 * ShilpSaathi (शिल्पसाथी)
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from both local server and root workspace
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function getBhashiniConfig() {
  return {
    userId: process.env.BHASHINI_USER_ID || 'd1702029b78b42f3937d49e75bb0ea9c',
    apiKey: process.env.BHASHINI_API_KEY || '0607f09a79-ec6c-4ce3-86dd-9ede07cf4b51',
    inferenceKey: process.env.BHASHINI_INFERENCE_API_KEY || 'umUa8kJX_oMiWfAay3xsSax6XRwlxnNzM6E_DA6RtPpvcAkyzKsxyI1jrZfpHDE5',
    pipelineId: (process.env.BHASHINI_PIPELINE_ID && process.env.BHASHINI_PIPELINE_ID.trim().length > 10)
      ? process.env.BHASHINI_PIPELINE_ID.trim()
      : '64392f96daac500b55c543cd',
    geminiKey: process.env.GEMINI_API_KEY || ''
  };
}

// Standard craft knowledge base for fallback & heuristic entity extraction
const CRAFT_CATEGORIES = [
  { keywords: ['कागज़', 'कागज', 'पेपर', 'डायरी', 'नोटबुक', 'लिफाफा', 'paper', 'stationery', 'diary', 'journal', 'sheet', 'card', 'papier'], category: 'Handmade Home Decor', craft_type: 'Handmade Paper & Stationery Craft', default_mat: 'Organic Plant Fiber & Recycled Cotton Pulp' },
  { keywords: ['बांस', 'केन', 'टोकरी', 'जूट', 'चटाई', 'रस्सी', 'bamboo', 'cane', 'jute', 'basket', 'mat'], category: 'Handmade Home Decor', craft_type: 'Natural Bamboo & Cane Weaving', default_mat: 'Seasoned Bamboo & Natural Jute Fiber' },
  { keywords: ['मिट्टी', 'घड़ा', 'कुल्हड़', 'दीया', 'बर्तन', 'गमला', 'मटका', 'सुराही', 'terracotta', 'clay', 'pottery', 'vase'], category: 'Clay & Terracotta', craft_type: 'Wheel Pottery / Terracotta Sculpting', default_mat: 'Natural Riverbed Clay' },
  { keywords: ['कपड़ा', 'साड़ी', 'दुपट्टा', 'शॉल', 'धागा', 'बुनाई', 'खादी', 'सूट', 'cotton', 'silk', 'handloom', 'runner', 'textile', 'weaving'], category: 'Textiles & Handloom', craft_type: 'Traditional Handloom Weaving', default_mat: 'Organic Cotton / Silk' },
  { keywords: ['लकड़ी', 'काष्ठ', 'नक्काशी', 'खिलौना', 'संदूक', 'डिब्बा', 'wood', 'wooden', 'carved', 'sheesham', 'teak'], category: 'Woodcraft', craft_type: 'Hand Carving & Inlay', default_mat: 'Seasoned Sheesham / Teak Wood' },
  { keywords: ['पीतल', 'तांबा', 'धातु', 'घंटी', 'ढोकरा', 'मूर्ति', 'brass', 'copper', 'dhokra', 'metal', 'bronze'], category: 'Metalcraft', craft_type: 'Dhokra Lost-Wax / Metal Casting', default_mat: 'Brass & Bell Metal' },
  { keywords: ['मधुबनी', 'पेंटिंग', 'चित्रकला', 'कलमकारी', 'वारली', 'पटचित्र', 'painting', 'madhubani', 'warli', 'kalamkari', 'art'], category: 'Folk Art & Paintings', craft_type: 'Madhubani / Folk Painting', default_mat: 'Handmade Canvas & Natural Pigments' },
  { keywords: ['चमड़ा', 'जूती', 'बैग', 'बटुआ', 'मोजड़ी', 'leather', 'mojari', 'jooti'], category: 'Leather Craft', craft_type: 'Handcrafted Traditional Leatherwork', default_mat: 'Vegetable-Tanned Genuine Leather' },
  { keywords: ['पत्थर', 'संगमरमर', 'stone', 'marble', 'sculpture'], category: 'Stone Carving', craft_type: 'Intricate Stone Inlay / Carving', default_mat: 'Natural Marble / Soapstone' }
];

const ITEM_NOUNS = [
  { en: 'Handmade Paper Sheet / Stationery', hi: 'हस्तनिर्मित कागज़ / स्टेशनरी', keys: ['कागज़', 'कागज', 'पेपर', 'डायरी', 'नोटबुक', 'लिखने', 'paper', 'sheet', 'diary', 'journal', 'stationery', 'card'] },
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
  { en: 'Traditional Wheel Pottery', hi: 'पारंपरिक चाक कुम्हारी', keys: ['wheel', 'pottery', 'terracotta', 'चाक', 'कुम्हार', 'मिट्टी'] },
  { en: 'Handloom Weaving', hi: 'हथकरघा बुनाई', keys: ['handloom', 'woven', 'weave', 'khadi', 'हथकरघा', 'बुनाई', 'खादी'] },
  { en: 'Hand Carving & Inlay', hi: 'हस्त नक्काशी', keys: ['carved', 'carving', 'inlay', 'नक्काशी', 'खुदाई'] },
  { en: 'Block Printing', hi: 'ठप्पा छपाई (Block Print)', keys: ['block print', 'ajrakh', 'dabu', 'ब्लॉक प्रिंट', 'छपाई'] },
  { en: 'Warli Folk Painting', hi: 'वारली पेंटिंग', keys: ['warli', 'वारली'] },
  { en: 'Kalamkari Art', hi: 'कलमकारी कला', keys: ['kalamkari', 'कलमकारी'] }
];

const MATERIALS_MAP = [
  { en: 'Organic Plant Fiber & Handmade Paper', hi: 'प्राकृतिक वनस्पति रेशा व हस्तनिर्मित कागज़', keys: ['कागज़', 'कागज', 'पेपर', 'रद्दी', 'पल्प', 'paper', 'pulp'] },
  { en: 'Natural Riverbed Clay & Terracotta', hi: 'प्राकृतिक नदी की मिट्टी', keys: ['terracotta', 'clay', 'mud', 'earthen', 'मिट्टी', 'टेराकोटा'] },
  { en: 'Pure Brass & Bell Metal', hi: 'शुद्ध पीतल एवं धातु', keys: ['brass', 'bronze', 'bell metal', 'metal', 'copper', 'पीतल', 'तांबा', 'धातु'] },
  { en: 'Organic Handloom Cotton', hi: 'हथकरघा सूती धागा', keys: ['cotton', 'khadi', 'सूती', 'कपास', 'खादी'] },
  { en: 'Pure Mulberry Silk', hi: 'शुद्ध रेशम', keys: ['silk', 'tussar', 'chanderi', 'रेशम', 'सिल्क'] },
  { en: 'Seasoned Sheesham / Teak Wood', hi: 'शीशम / सागवान की लकड़ी', keys: ['wood', 'wooden', 'sheesham', 'teak', 'लकड़ी', 'काष्ठ'] },
  { en: 'Vegetable-Tanned Genuine Leather', hi: 'प्राकृतिक चमड़ा', keys: ['leather', 'hide', 'चमड़ा'] },
  { en: 'Natural Marble & Stone', hi: 'प्राकृतिक संगमरमर व पत्थर', keys: ['stone', 'marble', 'पत्थर', 'संगमरमर'] }
];

const COLORS_MAP = [
  { en: 'Natural Off-White / Parchment', keys: ['कागज़', 'सफेद', 'सफ़ेद', 'white', 'cream', 'off-white'] },
  { en: 'Terracotta Red', keys: ['red', 'terracotta', 'लाल', 'गेरुआ'] },
  { en: 'Indigo Blue', keys: ['blue', 'indigo', 'नीला', 'आसमानी'] },
  { en: 'Mustard Yellow', keys: ['yellow', 'mustard', 'ochre', 'पीला', 'हल्दी'] },
  { en: 'Forest Green', keys: ['green', 'forest', 'हरा', 'धनी'] },
  { en: 'Golden Brass', keys: ['golden', 'gold', 'brass', 'सुनहरा', 'गोल्डन'] },
  { en: 'Natural Ochre & White', keys: ['ochre', 'क्रीम'] },
  { en: 'Charcoal Black', keys: ['black', 'charcoal', 'काला'] }
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
    console.log('[Bhashini] Credentials not set in .env; skipping Bhashini.');
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
    if (!configRes.ok && bhashini.pipelineId !== '64392f96daac500b55c543cd') {
      pipelinePayload.pipelineRequestConfig.pipelineId = '64392f96daac500b55c543cd';
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
      console.warn(`[Bhashini] Pipeline config failed with status ${configRes.status}:`, errText);
      return null;
    }

    const configData = await configRes.json();
    const asrCallbackUrl = configData?.pipelineInferenceAPIEndPoint?.callbackUrl;
    const headerName = configData?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.name || 'Authorization';
    const asrInferenceKey = configData?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || bhashini.inferenceKey;
    const serviceId = configData?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;

    if (!asrCallbackUrl || !serviceId) {
      console.warn('[Bhashini] Incomplete pipeline endpoints from Bhashini ULCA response.');
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
      console.warn(`[Bhashini] Inference API returned error status ${computeRes.status}:`, errText);
      return null;
    }

    const computeData = await computeRes.json();
    const transcript = computeData?.pipelineResponse?.[0]?.output?.[0]?.source;
    if (transcript && transcript.trim()) {
      console.log('[Bhashini] ✅ Transcription successful:', transcript.trim());
      return transcript.trim();
    }
  } catch (err) {
    console.error('[Bhashini] Error communicating with Bhashini API:', err.message);
  }

  return null;
}

/**
 * Extract structured catalog from raw spoken description using AI / NLP heuristics
 */
export async function extractCatalogFromText(rawText, sourceLanguage = 'hi') {
  const text = (rawText || '').trim();
  const bhashini = getBhashiniConfig();

  // Try Gemini if configured
  if (bhashini.geminiKey && text.length > 3) {
    try {
      console.log('[AI Catalog] Invoking Gemini LLM for structured catalog extraction...');
      const prompt = `You are ShilpSaathi AI, an e-commerce assistant for Indian traditional artisans.
Analyze the following artisan voice description (which may be in Hindi, English, Hinglish, or mixed regional languages) and generate a structured e-commerce catalog in JSON format.

Spoken Voice Description: "${text}"
Detected Language: "${sourceLanguage}"

Return ONLY a valid JSON object matching:
{
  "name": "Concise attractive English product title (e.g. Handcrafted Madhubani Terracotta Plate)",
  "category": "One of: Clay & Terracotta, Textiles & Handloom, Woodcraft, Metalcraft, Folk Art & Paintings, Leather Craft, Stone Carving, Handmade Home Decor",
  "craft_type": "Specific traditional craft technique (e.g. Dhokra Casting, Wheel Pottery, Block Print, Madhubani Art)",
  "material": "Primary materials used (e.g. Natural Riverbed Clay, Brass, Handloom Cotton)",
  "colour": "Dominant natural colors / hues",
  "description_hi": "Polished, cultural, e-commerce ready Hindi description (2-3 sentences)",
  "description_en": "Professional, heritage-focused English description (2-3 sentences)",
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "estimated_material_cost": 250,
  "estimated_labor_hours": 5
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${bhashini.geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const jsonStr = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          parsed.raw_material_cost = Number(parsed.raw_material_cost ?? parsed.estimated_material_cost ?? 150);
          parsed.hours_spent = Number(parsed.hours_spent ?? parsed.estimated_labor_hours ?? 4);
          parsed.estimated_material_cost = parsed.raw_material_cost;
          parsed.estimated_labor_hours = parsed.hours_spent;
          console.log('[AI Catalog] Gemini structured catalog successfully generated.');
          return parsed;
        }
      }
    } catch (geminiErr) {
      console.warn('[AI Catalog] Gemini LLM extraction notice:', geminiErr.message);
    }
  }

  // Intelligent craft entity heuristic extraction engine
  console.log('[AI Catalog] Using intelligent craft heuristic catalog extraction on text:', text);
  
  const lower = text.toLowerCase();

  // 1. Detect Item Noun
  let matchedNoun = ITEM_NOUNS.find(n => n.keys.some(k => lower.includes(k))) || { en: 'Craft Item', hi: 'हस्तशिल्प' };

  // 2. Detect Technique
  let matchedTechnique = CRAFT_TECHNIQUES.find(t => t.keys.some(k => lower.includes(k)));

  // 3. Detect Material
  let matchedMaterial = MATERIALS_MAP.find(m => m.keys.some(k => lower.includes(k)));

  // 4. Detect Category
  let matchedCategory = CRAFT_CATEGORIES.find(c => c.keywords.some(k => lower.includes(k))) || CRAFT_CATEGORIES[0];
  if (matchedMaterial && !matchedTechnique) {
    if (matchedMaterial.keys.includes('clay') || matchedMaterial.keys.includes('मिट्टी')) matchedCategory = CRAFT_CATEGORIES[0];
    else if (matchedMaterial.keys.includes('cotton') || matchedMaterial.keys.includes('silk')) matchedCategory = CRAFT_CATEGORIES[1];
    else if (matchedMaterial.keys.includes('wood') || matchedMaterial.keys.includes('लकड़ी')) matchedCategory = CRAFT_CATEGORIES[2];
    else if (matchedMaterial.keys.includes('brass') || matchedMaterial.keys.includes('पीतल')) matchedCategory = CRAFT_CATEGORIES[3];
  }

  // 5. Detect Colors
  const matchedColors = COLORS_MAP.filter(c => c.keys.some(k => lower.includes(k))).map(c => c.en);
  const colorStr = matchedColors.length > 0 ? matchedColors.join(' & ') : 'Natural Heritage Earth Tones';

  // 6. Detect hours spent (digits and words like 'दो घंटे', '4 hours')
  let hours = extractQuantity(text, ['hour', 'hr', 'ghante', 'घंटे', 'घंटा', 'दिन', 'day', 'समय']) || 4;
  hours = Math.min(40, Math.max(1, hours));

  // 7. Detect material cost (digits and words like 'बीस रुपये', '₹200')
  let cost = extractQuantity(text, ['₹', 'rs', 'rupee', 'रुपये', 'रुपया', 'लागत', 'cost', 'खर्च', 'कीमत']) || 150;
  cost = Math.min(10000, Math.max(10, cost));

  // 8. Dynamic Title Generation
  const techName = matchedTechnique ? matchedTechnique.en : (matchedMaterial ? `${matchedMaterial.en.split(' ')[0]} Art` : matchedCategory.category);
  const titleEn = `Handcrafted ${matchedMaterial ? matchedMaterial.en.split('&')[0].trim() : techName} ${matchedNoun.en}`.replace(/\s+/g, ' ').trim();

  // 9. Bilingual Descriptions reflecting exact spoken words and item
  const descHi = text.length > 5
    ? `कारीगर द्वारा पारंपरिक तकनीक से तैयार किया गया हस्तशिल्प। ${text}`
    : `कारीगर द्वारा शुद्ध पारंपरिक कला और प्राकृतिक सामग्री से तैयार की गई विशिष्ट कलाकृति। 100% हस्तनिर्मित और टिकाऊ।`;

  const descEn = `Authentic artisan-crafted ${matchedNoun.en.toLowerCase()} meticulously created with ${matchedMaterial ? matchedMaterial.en.toLowerCase() : 'natural sustainable materials'} using traditional ${techName.toLowerCase()} methods. Ideal for everyday use, cultural decor, and gifting.`;

  const keywords = [
    'handmade',
    matchedCategory.category.toLowerCase(),
    matchedNoun.en.split('/')[0].toLowerCase().trim().replace(/[^a-z0-9 ]/g, ''),
    'artisan made',
    'heritage craft',
    'eco-friendly'
  ].filter(Boolean);

  return {
    name: titleEn,
    category: matchedCategory.category,
    craft_type: matchedTechnique ? matchedTechnique.en : matchedCategory.craft_type,
    material: matchedMaterial ? matchedMaterial.en : matchedCategory.default_mat,
    colour: colorStr,
    description_hi: descHi,
    description_en: descEn,
    keywords: keywords,
    estimated_material_cost: cost,
    estimated_labor_hours: hours,
    raw_material_cost: cost,
    hours_spent: hours
  };
}

/**
 * End-to-end voice processing: Takes audio buffer or transcript and produces full catalog
 */
export async function processVoiceAudio({ audioBuffer, mimeType = 'audio/wav', directTranscript = null, language = 'hi' }) {
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

  // Generate structured catalog
  const catalog = await extractCatalogFromText(transcript || 'हस्तनिर्मित पारंपरिक भारतीय कलाकृति', language);

  return {
    transcript,
    catalog,
    source
  };
}

