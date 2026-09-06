import React from 'react';

export default function ScreenHeader({ title, subtitle, icon: Icon, step, totalSteps }) {
  return (
    <div className="mb-4">
      {step && (
        <span className="text-[10px] font-bold text-terracotta/70 uppercase tracking-widest">
          Step {step} of {totalSteps}
        </span>
      )}
      <h2 className="text-xl font-black text-charcoal leading-tight flex items-center gap-1.5 mt-0.5">
        {Icon && <Icon size={18} className="text-mustard" />}
        {title}
      </h2>
      {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}