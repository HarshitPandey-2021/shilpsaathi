/**
 * Fair Price Calculator Service
 * ShilpSaathi (शिल्पसाथी)
 *
 * Implements a transparent, heuristic pricing intelligence engine for traditional artisans.
 * Protects artisans from underpricing by incorporating material costs, skilled hourly rates,
 * craft complexity, overhead/wastage allowance, and sustainable profit margins.
 */

const SKILL_RATES = {
  basic: { label: 'Standard Craftsmanship', ratePerHour: 120 },
  skilled: { label: 'Skilled / Detailed Craft', ratePerHour: 180 },
  master: { label: 'Master Heritage Artisan', ratePerHour: 260 }
};

const CATEGORY_BENCHMARKS = {
  'Clay & Terracotta': { min: 300, max: 2500, avgLaborMultiplier: 1.15 },
  'Textiles & Handloom': { min: 450, max: 8500, avgLaborMultiplier: 1.25 },
  'Woodcraft': { min: 500, max: 12000, avgLaborMultiplier: 1.30 },
  'Metalcraft': { min: 600, max: 15000, avgLaborMultiplier: 1.35 },
  'Folk Art & Paintings': { min: 400, max: 9500, avgLaborMultiplier: 1.40 },
  'Leather Craft': { min: 550, max: 4500, avgLaborMultiplier: 1.20 },
  'Stone Carving': { min: 700, max: 20000, avgLaborMultiplier: 1.45 },
  'Default': { min: 350, max: 5000, avgLaborMultiplier: 1.20 }
};

/**
 * Calculate Fair Price with comprehensive breakdown
 */
export function calculateFairPrice({
  rawMaterialCost = 250,
  hoursSpent = 6,
  skillLevel = 'skilled',
  category = 'Clay & Terracotta'
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

  const reasoningEn = `Calculated with ₹${materials} raw materials + ${hours} hrs labor @ ₹${hourlyRate}/hr (${SKILL_RATES[skill].label}) + 12% workshop overhead + 25% fair artisan margin.`;
  const reasoningHi = `कच्चा माल (₹${materials}) + ${hours} घंटे कुशल श्रम (₹${hourlyRate}/घंटा) + 12% औजार/ऊर्जा खर्च + 25% उचित कारीगर लाभ जोड़कर गणना की गई।`;

  return {
    raw_material_cost: materials,
    hours_spent: hours,
    skill_level: skill,
    hourly_rate: hourlyRate,
    labor_cost: laborCost,
    overhead_cost: overheadCost,
    production_cost: productionCost,
    artisan_margin: artisanMargin,
    price_min: Math.max(minPrice, 100),
    price_max: Math.max(maxPrice, minPrice + 50),
    suggested_price: Math.max(suggestedPrice, 120),
    reasoning: reasoningEn,
    reasoning_hi: reasoningHi,
    reasoning_en: reasoningEn,
    benchmark: {
      category: category,
      typical_min: catBenchmark.min,
      typical_max: catBenchmark.max
    }
  };
}
