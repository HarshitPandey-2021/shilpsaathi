/**
 * Bhashini Speech-to-Text & AI Catalog Structuring Service
 * ShilpSaathi (शिल्पसाथी)
 */

import dotenv from 'dotenv';
dotenv.config();

const BHASHINI_USER_ID = process.env.BHASHINI_USER_ID;
const BHASHINI_API_KEY = process.env.BHASHINI_API_KEY;
const BHASHINI_INFERENCE_KEY = process.env.BHASHINI_INFERENCE_API_KEY || process.env.BHASHINI_API_KEY;
const BHASHINI_PIPELINE_ID = process.env.BHASHINI_PIPELINE_ID;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Standard craft knowledge base for fallback & heuristic entity extraction
const CRAFT_CATEGORIES = [
  { keywords: ['मिट्टी', 'घड़ा', 'कुल्हड़', 'दीया', 'बर्तन', 'terracotta', 'clay', 'pottery', 'vase'], category: 'Clay & Terracotta', craft_type: 'Wheel Pottery / Terracotta Sculpting', default_mat: 'Natural Riverbed Clay' },
  { keywords: ['कपड़ा', 'साड़ी', 'दुपट्टा', 'शॉल', 'धागा', 'बुनाई', 'खादी', 'cotton', 'silk', 'handloom', 'runner', 'textile', 'weaving'], category: 'Textiles & Handloom', craft_type: 'Traditional Handloom Weaving', default_mat: 'Organic Cotton / Silk' },
  { keywords: ['लकड़ी', 'काष्ठ', 'नक्काशी', 'खिलौना', 'wood', 'wooden', 'carved', 'sheesham', 'teak'], category: 'Woodcraft', craft_type: 'Hand Carving & Inlay', default_mat: 'Seasoned Sheesham / Teak Wood' },
  { keywords: ['पीतल', 'तांबा', 'धातु', 'घंटी', 'ढोकरा', 'brass', 'copper', 'dhokra', 'metal', 'bronze'], category: 'Metalcraft', craft_type: 'Dhokra Lost-Wax / Metal Casting', default_mat: 'Brass & Bell Metal' },
  { keywords: ['मधुबनी', 'पेंटिंग', 'चित्रकला', 'कलमकारी', 'वारली', 'painting', 'madhubani', 'warli', 'kalamkari', 'art'], category: 'Folk Art & Paintings', craft_type: 'Madhubani / Folk Painting', default_mat: 'Handmade Canvas & Natural Pigments' },
  { keywords: ['चमड़ा', 'जूती', 'बैग', 'leather', 'mojari', 'jooti'], category: 'Leather Craft', craft_type: 'Handcrafted Traditional Leatherwork', default_mat: 'Vegetable-Tanned Genuine Leather' },
  { keywords: ['पत्थर', 'संगमरमर', 'stone', 'marble', 'sculpture'], category: 'Stone Carving', craft_type: 'Intricate Stone Inlay / Carving', default_mat: 'Natural Marble / Soapstone' }
];

const ITEM_NOUNS = [
  { en: 'Vase / Pot', hi: 'फूलदान / घड़ा', keys: ['vase', 'pot', 'surahi', 'flower pot', 'फूलदान', 'सुराही', 'घड़ा', 'मटका', 'कुल्हड़'] },
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
  { en: 'Natural Riverbed Clay & Terracotta', hi: 'प्राकृतिक नदी की मिट्टी', keys: ['terracotta', 'clay', 'mud', 'earthen', 'मिट्टी', 'टेराकोटा'] },
  { en: 'Pure Brass & Bell Metal', hi: 'शुद्ध पीतल एवं धातु', keys: ['brass', 'bronze', 'bell metal', 'metal', 'copper', 'पीतल', 'तांबा', 'धातु'] },
  { en: 'Organic Handloom Cotton', hi: 'हथकरघा सूती धागा', keys: ['cotton', 'khadi', 'सूती', 'कपास', 'खादी'] },
  { en: 'Pure Mulberry Silk', hi: 'शुद्ध रेशम', keys: ['silk', 'tussar', 'chanderi', 'रेशम', 'सिल्क'] },
  { en: 'Seasoned Sheesham / Teak Wood', hi: 'शीशम / सागवान की लकड़ी', keys: ['wood', 'wooden', 'sheesham', 'teak', 'लकड़ी', 'काष्ठ'] },
  { en: 'Vegetable-Tanned Genuine Leather', hi: 'प्राकृतिक चमड़ा', keys: ['leather', 'hide', 'चमड़ा'] },
  { en: 'Natural Marble & Stone', hi: 'प्राकृतिक संगमरमर व पत्थर', keys: ['stone', 'marble', 'पत्थर', 'संगमरमर'] }
];

const COLORS_MAP = [
  { en: 'Terracotta Red', keys: ['red', 'terracotta', 'लाल', 'गेरुआ'] },
  { en: 'Indigo Blue', keys: ['blue', 'indigo', 'नीला', 'आसमानी'] },
  { en: 'Mustard Yellow', keys: ['yellow', 'mustard', 'ochre', 'पीला', 'हल्दी'] },
  { en: 'Forest Green', keys: ['green', 'forest', 'हरा', 'धनी'] },
  { en: 'Golden Brass', keys: ['golden', 'gold', 'brass', 'सुनहरा', 'गोल्डन'] },
  { en: 'Natural Ochre & White', keys: ['white', 'ochre', 'cream', 'सफेद', 'सफ़ेद', 'क्रीम'] },
  { en: 'Charcoal Black', keys: ['black', 'charcoal', 'काला'] }
];

/**
 * Transcribe audio using Bhashini ULCA ASR API
 */
export async function transcribeWithBhashini(audioBuffer, language = 'hi', mimeType = 'audio/webm') {
  if (!BHASHINI_USER_ID || !BHASHINI_API_KEY) {
    console.log('[Bhashini] Credentials not set in .env; using heuristic / client transcript fallback.');
    return null;
  }

  try {
    console.log(`[Bhashini] Initiating ASR transcription for language: ${language}...`);
    
    // Step 1: Query Pipeline Config
    const configRes = await fetch('https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'userID': BHASHINI_USER_ID,
        'ulcaApiKey': BHASHINI_API_KEY
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'asr',
            config: {
              language: { sourceLanguage: language }
            }
          }
        ],
        pipelineRequestConfig: {
          pipelineId: BHASHINI_PIPELINE_ID || '64392f96daac500b55c543d6'
        }
      })
    });

    if (!configRes.ok) {
      console.warn('[Bhashini] Pipeline config failed with status:', configRes.status);
      return null;
    }

    const configData = await configRes.json();
    const asrCallbackUrl = configData?.pipelineInferenceAPIEndPoint?.callbackUrl;
    const asrInferenceKey = configData?.pipelineInferenceAPIEndPoint?.inferenceApiKey?.value || BHASHINI_INFERENCE_KEY;
    const serviceId = configData?.pipelineResponseConfig?.[0]?.config?.[0]?.serviceId;

    if (!asrCallbackUrl || !serviceId) {
      console.warn('[Bhashini] Incomplete pipeline endpoints from Bhashini ULCA.');
      return null;
    }

    const base64Audio = audioBuffer.toString('base64');

    // Step 2: Compute Inference
    const computeRes = await fetch(asrCallbackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': asrInferenceKey
      },
      body: JSON.stringify({
        pipelineTasks: [
          {
            taskType: 'asr',
            config: {
              language: { sourceLanguage: language },
              serviceId: serviceId,
              audioFormat: mimeType.includes('wav') ? 'wav' : 'webm'
            }
          }
        ],
        inputData: {
          audio: [{ audioContent: base64Audio }]
        }
      })
    });

    if (!computeRes.ok) {
      console.warn('[Bhashini] Inference API returned error:', computeRes.status);
      return null;
    }

    const computeData = await computeRes.json();
    const transcript = computeData?.pipelineResponse?.[0]?.output?.[0]?.source;
    if (transcript && transcript.trim()) {
      console.log('[Bhashini] Transcription successful:', transcript);
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

  // Try Gemini if configured
  if (GEMINI_API_KEY && text.length > 3) {
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

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
          console.log('[AI Catalog] Gemini structured catalog successfully generated.');
          return parsed;
        }
      }
    } catch (geminiErr) {
      console.warn('[AI Catalog] Gemini LLM extraction failed or timed out:', geminiErr.message);
    }
  }

  // Intelligent craft entity heuristic extraction engine
  console.log('[AI Catalog] Using intelligent craft heuristic catalog extraction on text:', text);
  
  const lower = text.toLowerCase();

  // 1. Detect Item Noun
  let matchedNoun = ITEM_NOUNS.find(n => n.keys.some(k => lower.includes(k))) || { en: 'Craft Item', hi: 'हस्तशिल्प वस्तु' };

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
  const colorStr = matchedColors.length > 0 ? matchedColors.join(' & ') : 'Natural Heritage Tones';

  // 6. Detect hours spent if spoken
  let hours = 5;
  const hoursMatch = text.match(/(\d+)\s*(?:hour|hr|ghante|घंटे|घंटा|दिन|day)/i);
  if (hoursMatch) {
    hours = Math.min(40, Math.max(1, parseInt(hoursMatch[1], 10)));
  }

  // 7. Detect material cost if spoken
  let cost = 240;
  const costMatch = text.match(/(?:₹|rs|rupee|रुपये|लागत|cost)\s*[:=]?\s*(\d+)/i) || text.match(/(\d+)\s*(?:₹|rs|rupee|रुपये)/i);
  if (costMatch) {
    cost = Math.min(5000, Math.max(50, parseInt(costMatch[1], 10)));
  }

  // 8. Dynamic Title Generation
  const techName = matchedTechnique ? matchedTechnique.en : (matchedMaterial ? `${matchedMaterial.en.split(' ')[0]} Art` : matchedCategory.category);
  const titleEn = `Handcrafted ${techName} ${matchedNoun.en}`.replace(/\s+/g, ' ').trim();

  // 9. Bilingual Descriptions reflecting spoken words
  const descHi = text.length > 8
    ? `पारंपरिक तकनीक से तैयार किया गया हस्तशिल्प। ${text}`
    : `कारीगर द्वारा शुद्ध पारंपरिक कला और प्राकृतिक सामग्री से तैयार की गई विशिष्ट कलाकृति। 100% हस्तनिर्मित और टिकाऊ।`;

  const descEn = `Authentic artisan-crafted ${matchedNoun.en.toLowerCase()} showcasing traditional ${techName.toLowerCase()} with ${matchedMaterial ? matchedMaterial.en.toLowerCase() : 'natural materials'}. Created using sustainable indigenous heritage methods.`;

  const keywords = [
    'handmade',
    matchedCategory.category.toLowerCase(),
    matchedNoun.en.toLowerCase().replace(/[^a-z0-9 ]/g, ''),
    'heritage craft',
    'artisan made',
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
    estimated_labor_hours: hours
  };
}

/**
 * End-to-end voice processing: Takes audio buffer or transcript and produces full catalog
 */
export async function processVoiceAudio({ audioBuffer, mimeType = 'audio/webm', directTranscript = null, language = 'hi' }) {
  let transcript = (directTranscript || '').trim();

  if (!transcript && audioBuffer) {
    // Attempt Bhashini ASR
    const bhashiniText = await transcribeWithBhashini(audioBuffer, language, mimeType);
    if (bhashiniText) {
      transcript = bhashiniText;
    }
  }

  // If still no transcript was spoken or transcribed
  if (!transcript) {
    transcript = language === 'en'
      ? 'Handcrafted traditional artisan craft item made with natural sustainable materials.'
      : 'हस्तनिर्मित पारंपरिक कलाकृति जो प्राकृतिक और टिकाऊ सामग्री से तैयार की गई है।';
  }

  // Generate structured catalog
  const catalog = await extractCatalogFromText(transcript, language);

  return {
    transcript,
    catalog,
    source: directTranscript ? 'direct_speech_api' : (BHASHINI_API_KEY ? 'bhashini_asr' : 'heuristic_speech_engine')
  };
}

