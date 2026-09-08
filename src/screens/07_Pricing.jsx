import React, { useMemo } from 'react';
import { ArrowRight, Minus, Plus, TrendingUp, Package, Clock } from 'lucide-react';
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-stone-100 text-stone-600 active:scale-95"
        >
          <Minus size={20} strokeWidth={3} />
        </button>
        <p className="flex-1 text-center font-display text-2xl font-black tabular-nums text-charcoal">
          {unit === '₹' ? '₹' : ''}{value}{unit !== '₹' ? ` ${unit}` : ''}
        </p>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta-50 text-terracotta active:scale-95"
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

  const price = Number(productData.final_price) || 0;
  const step = calc.suggested > 5000 ? 50 : 10;

  const applySuggested = () => updateProduct({
    price_min: calc.min, price_max: calc.max, final_price: calc.suggested,
    price_reasoning: `₹${matCost} ${t.matCost} + ${hours}h × ₹${HOURLY_RATE} + 12% + 25%`,
  });

  const verdict =
    price < calc.min ? { text: t.belowRange, tone: 'border-amber-200 bg-amber-50 text-amber-700' }
    : price > calc.max ? { text: t.aboveRange, tone: 'border-amber-200 bg-amber-50 text-amber-700' }
    : { text: t.inRange, tone: 'border-forest-200 bg-forest-50 text-forest' };

  return (
    <div className="space-y-4 animate-fade-in-up">
      <ScreenHeader title={t.priceTitle} subtitle={t.askInputs} icon={TrendingUp} step={5} totalSteps={6} />

      <div className="grid grid-cols-2 gap-2.5">
        <Stepper icon={Package} label={t.matCost} value={matCost} unit="₹" step={25} min={0} max={20000}
          onChange={(v) => updateProduct({ raw_material_cost: v })} />
        <Stepper icon={Clock} label={t.hoursWorked} value={hours} unit="h" step={1} min={1} max={200}
          onChange={(v) => updateProduct({ hours_spent: v })} />
      </div>

      <button onClick={applySuggested} className="relative w-full overflow-hidden rounded-[1.75rem] bg-gold p-4 text-center shadow-lift active:scale-[0.98]">
        <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/25 blur-2xl" />
        <p className="relative text-2xs font-black uppercase tracking-[0.15em] text-mustard-800">{t.suggestedRange}</p>
        <p className="relative mt-1 font-display text-3xl font-black leading-none text-charcoal">
          ₹{calc.min} – ₹{calc.max}
        </p>
      </button>

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

      <div className="space-y-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-card">
        <p className="text-center text-2xs font-black uppercase tracking-wide text-stone-400">{t.setFinalPrice}</p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => updateProduct({ final_price: Math.max(0, price - step) })}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-stone-100 text-stone-600 shadow-card active:scale-95">
            <Minus size={26} strokeWidth={3} />
          </button>
          <span className="min-w-0 flex-1 text-center font-display text-[2.6rem] font-black leading-none tabular-nums text-terracotta">
            ₹{price}
          </span>
          <button onClick={() => updateProduct({ final_price: price + step })}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl bg-craft text-white shadow-lift active:scale-95">
            <Plus size={26} strokeWidth={3} />
          </button>
        </div>
        <input type="range" min={Math.max(10, Math.round(calc.min * 0.5))} max={Math.round(calc.max * 1.8)} step={step}
          value={Math.min(Math.round(calc.max * 1.8), Math.max(10, price))}
          onChange={(e) => updateProduct({ final_price: Number(e.target.value) })}
          className="range-craft" />
        <p className={`rounded-2xl border px-3 py-2.5 text-center text-xs font-black ${verdict.tone}`}>{verdict.text}</p>
      </div>

      <PrimaryButton onClick={nextStep} disabled={price <= 0} iconRight={ArrowRight}>{t.reviewBtn}</PrimaryButton>
    </div>
  );
}