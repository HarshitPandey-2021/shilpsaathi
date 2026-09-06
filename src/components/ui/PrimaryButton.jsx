import React from 'react';
export default function PrimaryButton({ children, onClick, disabled, variant = 'primary', icon: Icon }) {
  const styles = {
    primary: 'bg-terracotta hover:bg-[#8e3e29] text-white shadow-terracotta/20',
    success: 'bg-forest hover:bg-[#326647] text-white shadow-forest/25',
    ghost: 'bg-stone-200 hover:bg-stone-300 text-charcoal shadow-none',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none ${styles[variant]}`}
    >
      {Icon && <Icon size={18} />} {children}
    </button>
  );
}