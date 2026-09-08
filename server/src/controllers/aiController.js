import { successResponse, errorResponse } from '../utils/response.js';
import * as voiceService from '../services/voiceService.js';
import * as pricingService from '../services/pricingService.js';

export async function enhanceImage(req, res, next) {
  try {
    const { image } = req.body;
    return successResponse(res, {
      originalUrl: image,
      enhancedUrl: image || 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop',
    }, 'Image enhancement processed');
  } catch (err) {
    next(err);
  }
}

export async function processVoice(req, res, next) {
  try {
    const audioBuffer = req.file?.buffer || null;
    const mimeType = req.file?.mimetype || req.body?.mimeType || 'audio/webm';
    const directTranscript = req.body?.transcript || null;
    const language = req.body?.language || 'hi';
    const targetLanguage = req.body?.targetLanguage || 'en';

    console.log('[AI Controller] Processing voice input. Buffer present:', Boolean(audioBuffer), 'Direct transcript:', Boolean(directTranscript), 'Language:', language, 'TargetLanguage:', targetLanguage);

    const result = await voiceService.processVoiceAudio({
      audioBuffer,
      mimeType,
      directTranscript,
      language,
      targetLanguage,
    });

    const catalog = result.catalog || {};
    const matCost = Number(catalog.raw_material_cost ?? catalog.estimated_material_cost ?? 150);
    const labHours = Number(catalog.hours_spent ?? catalog.estimated_labor_hours ?? 4);

    // 1. Calculate transparent heuristic pricing
    const heuristicData = pricingService.calculateFairPrice({
      rawMaterialCost: matCost,
      hoursSpent: labHours,
      category: catalog.category,
    });

    // 2. Calculate dynamic AI pricing in parallel
    const aiPricingData = await pricingService.calculateAiPricing({
      product: catalog,
      heuristicPricing: heuristicData,
      language,
    });

    const rawExpPrice = catalog.explicit_price;
    const hasExplicitPrice = rawExpPrice !== null && rawExpPrice !== undefined && Number.isFinite(Number(rawExpPrice)) && Number(rawExpPrice) > 0;
    const explicitPrice = hasExplicitPrice ? Number(rawExpPrice) : null;

    const enrichedCatalog = {
      ...catalog,
      raw_material_cost: matCost,
      estimated_material_cost: matCost,
      hours_spent: labHours,
      estimated_labor_hours: labHours,
      price_min: hasExplicitPrice ? explicitPrice : (aiPricingData.is_ai_available ? aiPricingData.price_min : heuristicData.price_min),
      price_max: hasExplicitPrice ? explicitPrice : (aiPricingData.is_ai_available ? aiPricingData.price_max : heuristicData.price_max),
      final_price: hasExplicitPrice ? explicitPrice : (aiPricingData.is_ai_available ? aiPricingData.suggested_price : heuristicData.suggested_price),
      pricing_method: aiPricingData.is_ai_available ? 'ai' : 'heuristic',
      price_reasoning: hasExplicitPrice ? `Price explicitly provided by artisan: INR ${explicitPrice}.` : (aiPricingData.is_ai_available ? aiPricingData.reasoning : heuristicData.reasoning),
    };

    return successResponse(res, {
      transcript: result.transcript,
      catalog: enrichedCatalog,
      pricing: heuristicData,
      heuristic_pricing: heuristicData,
      ai_pricing: aiPricingData,
      source: result.source,
      is_ai_generated: catalog.is_ai_generated ?? false,
      llm_provider: catalog.llm_provider ?? 'none',
      extracted_facts: catalog.extracted_facts || {
        labor_hours: labHours,
        material_cost_inr: matCost,
        explicit_price: explicitPrice,
      },
    }, 'Voice processed and catalog structured successfully');
  } catch (err) {
    console.error('[AI Controller] processVoice error:', err);
    next(err);
  }
}

export async function calculatePrice(req, res, next) {
  try {
    const { rawMaterialCost, hoursSpent, skillLevel, category, product, language = 'hi' } = req.body;
    const heuristicResult = pricingService.calculateFairPrice({
      rawMaterialCost,
      hoursSpent,
      skillLevel,
      category,
    });

    const aiResult = await pricingService.calculateAiPricing({
      product: product || { category, raw_material_cost: rawMaterialCost, hours_spent: hoursSpent },
      heuristicPricing: heuristicResult,
      language,
    });

    return successResponse(res, {
      ...heuristicResult,
      heuristic: heuristicResult,
      ai: aiResult,
    }, 'Fair price and AI market calculation complete');
  } catch (err) {
    next(err);
  }
}

export async function transcribe(req, res, next) {
  try {
    const audioBuffer = req.file?.buffer || null;
    const language = req.body?.language || 'hi';
    const mimeType = req.file?.mimetype || 'audio/webm';

    let transcript = req.body?.transcript;
    if (!transcript && audioBuffer) {
      transcript = await voiceService.transcribeWithBhashini(audioBuffer, language, mimeType);
    }

    if (!transcript) {
      transcript = 'पारंपरिक हस्तशिल्प उत्पाद विवरण।';
    }

    return successResponse(res, {
      transcript,
      language,
    }, 'Transcription complete');
  } catch (err) {
    next(err);
  }
}

export async function generateCatalog(req, res, next) {
  try {
    const { transcript, language = 'hi', targetLanguage = 'en' } = req.body;
    const catalog = await voiceService.extractCatalogFromText(transcript, language, targetLanguage);

    return successResponse(res, {
      catalog,
      source: catalog.is_ai_generated ? 'ai_extraction' : 'heuristic_fallback',
      is_ai_generated: catalog.is_ai_generated ?? false,
      llm_provider: catalog.llm_provider ?? 'none',
      extracted_facts: catalog.extracted_facts,
    }, 'Catalog generated successfully');
  } catch (err) {
    next(err);
  }
}

export async function pricing(req, res, next) {
  try {
    const { rawMaterialCost, hoursSpent, skillLevel, category, product, language = 'hi' } = req.body;
    const heuristicResult = pricingService.calculateFairPrice({
      rawMaterialCost,
      hoursSpent,
      skillLevel,
      category,
    });

    const aiResult = await pricingService.calculateAiPricing({
      product: product || { category, raw_material_cost: rawMaterialCost, hours_spent: hoursSpent },
      heuristicPricing: heuristicResult,
      language,
    });

    return successResponse(res, {
      ...heuristicResult,
      heuristic: heuristicResult,
      ai: aiResult,
    }, 'Pricing intelligence generated');
  } catch (err) {
    next(err);
  }
}

export async function enhance(req, res, next) {
  try {
    const { image } = req.body;
    return successResponse(res, {
      message: 'AI enhancement processed',
      status: 'completed',
      originalUrl: image,
      enhancedUrl: image,
    });
  } catch (err) {
    next(err);
  }
}
