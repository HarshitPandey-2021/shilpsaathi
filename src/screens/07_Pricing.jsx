import React, { useMemo, useEffect } from 'react';
import { ArrowRight, Minus, Plus, TrendingUp, Package, Clock, Sparkles, Check, Calculator, AlertCircle, Info } from 'lucide-react';
import { useCraft } from '../context/CraftContext';
import ScreenHeader from '../components/ui/ScreenHeader';
import PrimaryButton from '../components/ui/PrimaryButton';

const HOURLY_RATE = 125;

function Stepper({ icon: Icon, label, value, unit, step, min, max, onChange }) {
  return (
    <div className="space-y-2 rounded-3xl border border-stone-200 bg-white p-3.5 shadow-card">
      <p className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wide text-stone-400">
        <Icon size={12} /> {label}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-600 active:scale-95 transition"
        >
          <Minus size={20} strokeWidth={3} />
        </button>
        <p className="flex-1 text-center font-display text-2xl font-black tabular-nums text-charcoal">
          {unit === '₹' ? '₹' : ''}{value}{unit !== '₹' ? ` ${unit}` : ''}
        </p>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta-50 text-terracotta active:scale-95 transition"
        >
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

export default function PricingScreen() {
  const { productData, updateProduct, nextStep, t } = useCraft();

  const matCost = Number(productData.raw_material_cost) || 0;
  const hours = Number(productData.hours_spent) || 1;

  // Real-time calculation for heuristic formula
  const calc = useMemo(() => {
    const labour = hours * HOURLY_RATE;
    const base = matCost + labour;
    const overhead = Math.round(base * 0.12);
    const subtotal = base + overhead;
    const margin = Math.round(subtotal * 0.25);
    const suggested = subtotal + margin;
    return {
      labour, overhead, margin, suggested,
      min: Math.round(suggested * 0.85),
      max: Math.round(suggested * 1.25),
    };
  }, [matCost, hours]);

  const aiPricing = productData.ai_pricing || null;
  const hasAiPricing = Boolean(aiPricing && aiPricing.suggested_price);

  const selectedMethod = productData.pricing_method || (hasAiPricing ? 'ai' : 'heuristic');
  const price = Number(productData.final_price) || (selectedMethod === 'ai' && hasAiPricing ? aiPricing.suggested_price : calc.suggested);
  const step = price > 5000 ? 50 : 10;

  // Initialize final price on mount if not yet set
  useEffect(() => {
    if (!productData.final_price) {
      if (hasAiPricing) {
        selectAiPricing();
      } else {
        selectHeuristicPricing();
      }
    }
  }, []);

  const selectHeuristicPricing = () => {
    updateProduct({
      pricing_method: 'heuristic',
      final_price: calc.suggested,
      price_min: calc.min,
      price_max: calc.max,
      price_reasoning: `₹${matCost} ${t.matCost || 'Materials'} + ${hours}h × ₹${HOURLY_RATE} + 12% + 25%`,
    });
  };

  const selectAiPricing = () => {
    if (!hasAiPricing) return;
    updateProduct({
      pricing_method: 'ai',
      final_price: aiPricing.suggested_price,
      price_min: aiPricing.price_min || Math.round(aiPricing.suggested_price * 0.9),
      price_max: aiPricing.price_max || Math.round(aiPricing.suggested_price * 1.2),
      price_reasoning: aiPricing.reasoning || aiPricing.profit_note || 'AI Market & Profit Advisor suggestion',
    });
  };

  const handlePriceChange = (newPrice) => {
    updateProduct({
      final_price: Math.max(0, newPrice),
      pricing_method: 'custom',
    });
  };

  const activeMin = selectedMethod === 'ai' && hasAiPricing ? (aiPricing.price_min || calc.min) : calc.min;
  const activeMax = selectedMethod === 'ai' && hasAiPricing ? (aiPricing.price_max || calc.max) : calc.max;

  const verdict =
    price < activeMin ? { text: t.belowRange, tone: 'border-amber-200 bg-amber-50 text-amber-700' }
    : price > activeMax ? { text: t.aboveRange, tone: 'border-amber-200 bg-amber-50 text-amber-700' }
    : { text: t.inRange, tone: 'border-forest-200 bg-forest-50 text-forest' };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.priceTitle} subtitle={t.askInputs} icon={TrendingUp} step={5} totalSteps={6} />

      {/* Inputs Prefilled from Speech / Structured Facts */}
      <div className="grid grid-cols-2 gap-2.5">
        <Stepper icon={Package} label={t.matCost} value={matCost} unit="₹" step={25} min={0} max={20000}
          onChange={(v) => {
            updateProduct({
              raw_material_cost: v,
              ...(selectedMethod === 'heuristic' ? {
                final_price: Math.round(((v + hours * HOURLY_RATE) * 1.12 * 1.25) / 10) * 10,
                price_min: Math.round(((v + hours * HOURLY_RATE) * 1.12 * 1.25 * 0.85) / 10) * 10,
                price_max: Math.round(((v + hours * HOURLY_RATE) * 1.12 * 1.25 * 1.25) / 10) * 10,
              } : {})
            });
          }} />
        <Stepper icon={Clock} label={t.hoursWorked} value={hours} unit="h" step={1} min={1} max={200}
          onChange={(v) => {
            updateProduct({
              hours_spent: v,
              ...(selectedMethod === 'heuristic' ? {
                final_price: Math.round(((matCost + v * HOURLY_RATE) * 1.12 * 1.25) / 10) * 10,
                price_min: Math.round(((matCost + v * HOURLY_RATE) * 1.12 * 1.25 * 0.85) / 10) * 10,
                price_max: Math.round(((matCost + v * HOURLY_RATE) * 1.12 * 1.25 * 1.25) / 10) * 10,
              } : {})
            });
          }} />
      </div>

      {/* Side-by-Side Pricing Cards: Heuristic vs AI Advisor */}
      <div className="space-y-2">
        <p className="text-2xs font-black uppercase tracking-wide text-stone-400">
          {t.selectPricingPlan || 'मूल्य निर्धारण रणनीति चुनें (Select Strategy)'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Card 1: Heuristic Fair Cost */}
          <button
            type="button"
            onClick={selectHeuristicPricing}
            className={`relative flex flex-col justify-between rounded-3xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
              selectedMethod === 'heuristic'
                ? 'border-mustard-500 bg-mustard-50/70 shadow-lift'
                : 'border-stone-200 bg-white shadow-card hover:border-stone-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wide text-stone-600">
                  <Calculator size={13} className="text-mustard-600" />
                  {t.costBasedPricing || 'लागत अनुसार मूल्य'}
                </span>
                {selectedMethod === 'heuristic' && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-mustard-500 text-white">
                    <Check size={12} strokeWidth={3} />
                  </span>
                )}
              </div>
              <p className="font-display text-2xl font-black text-charcoal">
                ₹{calc.suggested}
              </p>
              <p className="text-[11px] font-semibold text-stone-500">
                रेंज: ₹{calc.min} – ₹{calc.max}
              </p>
            </div>
            <div className="mt-2.5 border-t border-stone-200/60 pt-2 text-[10px] text-stone-500 leading-tight">
              ₹{matCost} कच्चा माल + {hours}h श्रम + 12% ओवरहेड + 25% मार्जिन
            </div>
          </button>

          {/* Card 2: AI Market & Profit Advisor */}
          {hasAiPricing ? (
            <button
              type="button"
              onClick={selectAiPricing}
              className={`relative flex flex-col justify-between rounded-3xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
                selectedMethod === 'ai'
                  ? 'border-forest-500 bg-forest-50/70 shadow-lift'
                  : 'border-stone-200 bg-white shadow-card hover:border-stone-300'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wide text-forest-700">
                    <Sparkles size={13} className="text-forest" />
                    {t.aiMarketAdvisor || 'AI बाज़ार व लाभ सलाहकार'}
                  </span>
                  {selectedMethod === 'ai' && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <p className="font-display text-2xl font-black text-forest-800">
                  ₹{aiPricing.suggested_price}
                </p>
                <p className="text-[11px] font-semibold text-forest-600">
                  रेंज: ₹{aiPricing.price_min || Math.round(aiPricing.suggested_price * 0.9)} – ₹{aiPricing.price_max || Math.round(aiPricing.suggested_price * 1.2)}
                </p>
              </div>
              <div className="mt-2.5 border-t border-forest-100 pt-2 text-[10px] text-forest-700 leading-tight">
                <span className="font-bold">💡 {aiPricing.positioning || aiPricing.market_positioning || 'बाज़ार स्थिति'}: </span>
                {aiPricing.advisor_note || aiPricing.advisor_note_hi || aiPricing.advisor_note_en || aiPricing.profit_note || aiPricing.reasoning}
              </div>
            </button>
          ) : (
            <div className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-stone-50/80 p-3.5 text-left opacity-80">
              <div className="space-y-1">
                <span className="flex items-center gap-1.5 text-2xs font-bold text-stone-500">
                  <Sparkles size={13} className="text-stone-400" />
                  {t.aiMarketAdvisor || 'AI बाज़ार सलाहकार'}
                </span>
                <p className="text-xs font-bold text-stone-500">
                  {t.aiPricingUnavailable || 'AI सुझाव अस्थायी रूप से अनुपलब्ध है'}
                </p>
              </div>
              <p className="mt-2 text-[10px] text-stone-400 leading-tight">
                लागत आधारित मूल्य गणना का उपयोग किया जा रहा है।
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-1.5 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
        <p className="mb-1 text-2xs font-black uppercase tracking-wide text-stone-400">{t.costBreakdown}</p>
        {[
          [t.matCost, matCost],
          [`${t.labourCost} · ${hours}h × ₹${HOURLY_RATE}`, calc.labour],
          [t.overhead, calc.overhead],
          [t.margin, calc.margin],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-stone-500">{k}</span>
            <span className="font-bold tabular-nums text-charcoal">₹{v}</span>
          </div>
        ))}
        <div className="mt-1.5 flex justify-between border-t border-stone-100 pt-2">
          <span className="text-xs font-black text-stone-600">{t.totalCost}</span>
          <span className="font-display text-lg font-black tabular-nums text-forest">₹{calc.suggested}</span>
        </div>
      </div>

      {/* Final Price Fine-Tuning Slider */}
      <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-2xs font-black uppercase tracking-wide text-stone-400">{t.setFinalPrice}</p>
          <span className="chip border-stone-200 bg-stone-50 text-[10px] text-stone-500">
            {selectedMethod === 'ai' ? '🤖 AI Suggestion' : selectedMethod === 'heuristic' ? '📊 Fair Cost' : '✍️ Custom'}
          </span>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => handlePriceChange(price - step)}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-stone-100 text-stone-600 shadow-card active:scale-95">
            <Minus size={26} strokeWidth={3} />
          </button>
          <span className="min-w-0 flex-1 text-center font-display text-[2.6rem] font-black leading-none tabular-nums text-terracotta">
            ₹{price}
          </span>
          <button onClick={() => handlePriceChange(price + step)}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-craft text-white shadow-lift active:scale-95">
            <Plus size={26} strokeWidth={3} />
          </button>
        </div>
        <input type="range" min={Math.max(10, Math.round(activeMin * 0.5))} max={Math.round(activeMax * 1.8)} step={step}
          value={Math.min(Math.round(activeMax * 1.8), Math.max(10, price))}
          onChange={(e) => handlePriceChange(Number(e.target.value))}
          className="range-craft" />
        <p className={`rounded-2xl border px-3 py-2.5 text-center text-xs font-black ${verdict.tone}`}>{verdict.text}</p>
      </div>

      <PrimaryButton onClick={nextStep} disabled={price <= 0} iconRight={ArrowRight}>{t.reviewBtn}</PrimaryButton>
    </div>
  );
}