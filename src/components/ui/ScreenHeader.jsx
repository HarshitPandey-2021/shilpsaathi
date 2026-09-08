import React from 'react';
import SpeakButton from './SpeakButton';


export default function ScreenHeader({
  title,
  subtitle,
  icon: Icon,
  step,
  totalSteps = 6,
  speak,
  className = '',
}) {
  const showStep = Number.isFinite(step);

  return (
    <header className={`space-y-2 ${className}`}>
      {showStep && (
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-terracotta-50 px-2.5 py-1 text-2xs font-black uppercase tracking-widest text-terracotta-600">
            {step} / {totalSteps}
          </span>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: totalSteps }, (_, i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-craft' : 'bg-stone-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex items-start gap-2.5">
        {Icon && (
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mustard-50 text-mustard-500 shadow-xs">
            <Icon size={18} strokeWidth={2.4} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-black leading-tight text-charcoal">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-xs leading-snug text-stone-500">{subtitle}</p>
          )}
        </div>
        <SpeakButton text={speak ?? `${title}। ${subtitle || ''}`} className="mt-0.5" />
      </div>
      <div className="motif-rule motif-fade opacity-70" />
    </header>
  );
}