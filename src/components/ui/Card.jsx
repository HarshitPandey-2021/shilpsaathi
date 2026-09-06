import React from 'react';
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white p-4 rounded-2xl border border-stone-200 shadow-xs ${className}`}>
      {children}
    </div>
  );
}