import React from 'react';
export default function ScreenHeader({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-black text-charcoal leading-tight">{title}</h2>
      {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}