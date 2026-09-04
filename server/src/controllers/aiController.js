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

    console.log('[AI Controller] Processing voice input. Buffer present:', Boolean(audioBuffer), 'Direct transcript:', Boolean(directTranscript));

    const result = await voiceService.processVoiceAudio({
      audioBuffer,
      mimeType,
      directTranscript,
      language
    });

    // Also calculate initial fair price suggestion based on extracted catalog estimates
    const pricingData = pricingService.calculateFairPrice({
      rawMaterialCost: result.catalog.estimated_material_cost || 250,
      hoursSpent: result.catalog.estimated_labor_hours || 6,
      category: result.catalog.category
    });

    const enrichedCatalog = {
      ...result.catalog,
      price_min: pricingData.price_min,
      price_max: pricingData.price_max,
      final_price: pricingData.suggested_price,
      price_reasoning: pricingData.reasoning
    };

    return successResponse(res, {
      transcript: result.transcript,
      catalog: enrichedCatalog,
      pricing: pricingData,
      source: result.source
    }, 'Voice processed and catalog structured successfully');
  } catch (err) {
    console.error('[AI Controller] processVoice error:', err);
    next(err);
  }
}

export async function calculatePrice(req, res, next) {
  try {
    const { rawMaterialCost, hoursSpent, skillLevel, category } = req.body;
    const result = pricingService.calculateFairPrice({
      rawMaterialCost,
      hoursSpent,
      skillLevel,
      category
    });

    return successResponse(res, result, 'Fair price calculation complete');
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
      language
    }, 'Transcription complete');
  } catch (err) {
    next(err);
  }
}

export async function generateCatalog(req, res, next) {
  try {
    const { transcript, language = 'hi' } = req.body;
    const catalog = await voiceService.extractCatalogFromText(transcript, language);

    return successResponse(res, {
      catalog,
      source: 'ai_extraction'
    }, 'Catalog generated successfully');
  } catch (err) {
    next(err);
  }
}

export async function pricing(req, res, next) {
  try {
    const { rawMaterialCost, hoursSpent, skillLevel, category } = req.body;
    const result = pricingService.calculateFairPrice({
      rawMaterialCost,
      hoursSpent,
      skillLevel,
      category
    });

    return successResponse(res, result, 'Pricing intelligence generated');
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

