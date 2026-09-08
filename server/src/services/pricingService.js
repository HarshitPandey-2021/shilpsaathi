/**
 * Fair Price Calculator & Dynamic AI Pricing Advisor Service
 * ShilpSaathi (शिल्पसाथी)
 *
 * Implements:
 * 1. Transparent Heuristic Pricing Engine (materials + skilled labor + 12% overhead + 25% fair margin)
 * 2. Dynamic AI Market & Profit Advisor (Gemini -> Groq fallback)
 */

import { callLlmWithFallback } from './llmService.js';

const SKILL_RATES = {
  basic: { label: 'Standard Craftsmanship', ratePerHour: 120 },
  skilled: { label: 'Skilled / Detailed Craft', ratePerHour: 180 },
  master: { label: 'Master Heritage Artisan', ratePerHour: 260 },
};

const CATEGORY_BENCHMARKS = {
  'Clay & Terracotta': { min: 300, max: 2500, avgLaborMultiplier: 1.15 },
  'Textiles & Handloom': { min: 450, max: 8500, avgLaborMultiplier: 1.25 },
  'Woodcraft': { min: 500, max: 12000, avgLaborMultiplier: 1.30 },
  'Metalcraft': { min: 600, max: 15000, avgLaborMultiplier: 1.35 },
  'Folk Art & Paintings': { min: 400, max: 9500, avgLaborMultiplier: 1.40 },
  'Leather Craft': { min: 550, max: 4500, avgLaborMultiplier: 1.20 },
  'Stone Carving': { min: 700, max: 20000, avgLaborMultiplier: 1.45 },
  'Handmade Home Decor': { min: 350, max: 6000, avgLaborMultiplier: 1.25 },
  'Bags & Accessories': { min: 300, max: 4000, avgLaborMultiplier: 1.20 },
  'Default': { min: 350, max: 5000, avgLaborMultiplier: 1.20 },
};

/**
 * Calculate Fair Price with transparent cost breakdown
 */
export function calculateFairPrice({
  rawMaterialCost = 250,
  hoursSpent = 6,
  skillLevel = 'skilled',
  category = 'Clay & Terracotta',
}) {
  const materials = Math.max(0, Number(rawMaterialCost) || 0);
  const hours = Math.max(0.5, Number(hoursSpent) || 1);
  const skill = SKILL_RATES[skillLevel] ? skillLevel : 'skilled';
  const hourlyRate = SKILL_RATES[skill].ratePerHour;

  // 1. Direct Labor Value
  const laborCost = Math.round(hours * hourlyRate);

  // 2. Workshop & Tool / Energy Overhead allowance (12%)
  const overheadCost = Math.round((materials + laborCost) * 0.12);

  // 3. True Cost of Production (COP)
  const productionCost = materials + laborCost + overheadCost;

  // 4. Fair Artisan Sustainable Profit Margin (25%)
  const artisanMargin = Math.round(productionCost * 0.25);

  // 5. Benchmark multiplier
  const catBenchmark = CATEGORY_BENCHMARKS[category] || CATEGORY_BENCHMARKS['Default'];

  // 6. Final Recommended Price Bands
  const basePrice = productionCost + artisanMargin;
  const minPrice = Math.round((basePrice * 0.92) / 10) * 10;
  const maxPrice = Math.round((basePrice * 1.22) / 10) * 10;
  const suggestedPrice = Math.round(basePrice / 10) * 10;

  const reasoningEn = `Calculated from ₹${materials} materials + ${hours}h labor @ ₹${hourlyRate}/hr + 12% overhead + 25% fair artisan margin.`;
  const reasoningHi = `कच्चा माल (₹${materials}) + ${hours} घंटे श्रम (₹${hourlyRate}/घंटा) + 12% अतिरिक्त खर्च + 25% उचित लाभ।`;

  return {
    raw_material_cost: materials,
    estimated_material_cost: materials,
    hours_spent: hours,
    estimated_labor_hours: hours,
    skill_level: skill,
    hourly_rate: hourlyRate,
    labor_cost: laborCost,
    overhead_cost: overheadCost,
    production_cost: productionCost,
    artisan_margin: artisanMargin,
    price_min: Math.max(minPrice, 20),
    price_max: Math.max(maxPrice, minPrice + 20),
    suggested_price: Math.max(suggestedPrice, 30),
    reasoning: reasoningEn,
    reasoning_hi: reasoningHi,
    reasoning_en: reasoningEn,
    benchmark: {
      category,
      typical_min: catBenchmark.min,
      typical_max: catBenchmark.max,
    },
  };
}

/**
 * AI Dynamic Pricing & Profit Advisor
 * Uses Gemini -> Groq fallback to analyze craft context and recommend market positioning.
 */
export async function calculateAiPricing({
  product = {},
  heuristicPricing = null,
  rawMaterialCost = null,
  hoursSpent = null,
  category = null,
  language = 'hi',
}) {
  const hp = heuristicPricing || calculateFairPrice({
    rawMaterialCost: rawMaterialCost ?? product.raw_material_cost ?? 200,
    hoursSpent: hoursSpent ?? product.hours_spent ?? 4,
    category: category ?? product.category ?? 'Handmade Home Decor',
  });

  const prompt = `You are an AI Dynamic Pricing and Profit Advisor for ShilpSaathi, an e-commerce platform for traditional Indian artisans.

Given the craft product details and its transparent cost-of-production breakdown, provide an intelligent market price recommendation, suggested price range, and a short actionable profit advisor note.

Product Details:
- Title: "${product.name || 'Handcrafted Artisan Item'}"
- Category: "${product.category || hp.benchmark?.category || 'Handmade Home Decor'}"
- Material: "${product.material || 'Natural craft material'}"
- Colour: "${product.colour || 'Natural'}"
- Description: "${product.description_en || product.description_hi || ''}"

Heuristic Cost Analysis:
- Raw Material Cost: ₹${hp.raw_material_cost}
- Labor Hours: ${hp.hours_spent} hours
- Labor Cost Value: ₹${hp.labor_cost}
- Workshop Overhead (12%): ₹${hp.overhead_cost}
- Production Cost: ₹${hp.production_cost}
- Heuristic Base Price (25% margin): ₹${hp.suggested_price}

TASK:
1. "suggested_price": Recommend an optimal e-commerce market selling price in ₹ INR (rounded to nearest 10). Consider craft aesthetics, perceived value of handmade authenticity, and fair artisan remuneration.
2. "price_min": Fair floor price in ₹ INR below which the artisan should not sell.
3. "price_max": Premium ceiling price in ₹ INR achievable on urban / online craft platforms.
4. "positioning": A concise positioning label (e.g., "Premium Heritage Decor", "Everyday Artisan Utility", "Festive Gifting", "Custom Collectible").
5. "advisor_note_en": A short 1-2 sentence qualitative profit note in English. Give practical market advice (e.g. why this price is viable, or suggestion on festive / urban demand).
6. "advisor_note_hi": The same short advice in Hindi.

Return ONLY a valid JSON object matching this schema:
{
  "suggested_price": 550,
  "price_min": 480,
  "price_max": 650,
  "positioning": "string",
  "advisor_note_en": "string",
  "advisor_note_hi": "string"
}`;

  console.log('[AI Pricing] Requesting dynamic AI pricing recommendation via LLM fallback chain...');
  const llmRes = await callLlmWithFallback(prompt, { temperature: 0.3 });

  if (llmRes.success && llmRes.data) {
    const data = llmRes.data;
    const sug = Math.max(30, Math.round((Number(data.suggested_price) || hp.suggested_price) / 10) * 10);
    const min = Math.max(20, Math.round((Number(data.price_min) || hp.price_min) / 10) * 10);
    const max = Math.max(min + 20, Math.round((Number(data.price_max) || hp.price_max) / 10) * 10);
    const noteEn = (data.advisor_note_en || data.advisor_note || '').trim() || `AI estimate based on ${data.positioning || 'handcrafted quality'} and fair profit margin.`;
    const noteHi = (data.advisor_note_hi || '').trim() || `हस्तनिर्मित गुणवत्ता और बाज़ार मांग के अनुसार AI द्वारा अनुशंसित मूल्य।`;

    return {
      is_ai_available: true,
      provider: llmRes.provider,
      suggested_price: sug,
      price_min: min,
      price_max: max,
      positioning: data.positioning || 'Handcrafted Market Value',
      advisor_note: language === 'hi' ? noteHi : noteEn,
      advisor_note_en: noteEn,
      advisor_note_hi: noteHi,
      reasoning: `AI Market Advisor (${data.positioning || 'Handcrafted'}): ${noteEn}`,
      heuristic: hp,
    };
  }

  // Graceful Fallback if both Gemini and Groq fail
  return {
    is_ai_available: false,
    provider: 'heuristic',
    suggested_price: hp.suggested_price,
    price_min: hp.price_min,
    price_max: hp.price_max,
    positioning: 'Standard Fair Price',
    advisor_note: language === 'hi'
      ? 'AI बाज़ार सलाहकार अनुपलब्ध है। आपकी सामग्री और श्रम लागत पर आधारित पारदर्शी मूल्य तैयार है।'
      : 'AI market advisor temporarily unavailable. Fair price calculated from material and labor hours is ready.',
    advisor_note_en: 'AI market advisor temporarily unavailable. Fair price calculated from material and labor hours is ready.',
    advisor_note_hi: 'AI बाज़ार सलाहकार अनुपलब्ध है। आपकी सामग्री और श्रम लागत पर आधारित पारदर्शी मूल्य तैयार है।',
    reasoning: hp.reasoning,
    heuristic: hp,
  };
}
