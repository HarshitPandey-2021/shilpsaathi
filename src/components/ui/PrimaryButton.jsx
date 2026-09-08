import React from 'react';

const VARIANTS = {
  primary:   'bg-craft text-white shadow-lift hover:brightness-110',
  success:   'bg-leaf text-white shadow-lift hover:brightness-110',
  gold:      'bg-gold text-charcoal shadow-lift hover:brightness-105',
  secondary: 'bg-white text-terracotta border border-terracotta-200 shadow-card hover:bg-terracotta-50',
  ghost:     'bg-stone-100 text-stone-700 hover:bg-stone-200',
};

export default function PrimaryButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  icon: Icon,
  iconRight: IconRight,
  full = true,
  className = '',
  type = 'button',
  ...rest
}) {
  const isOff = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isOff}
      className={[
        'relative overflow-hidden touch rounded-3xl px-5 py-4',
        'font-bold text-sm tracking-tight',
        'inline-flex items-center justify-center gap-2',
        'transition-all duration-200 active:scale-[0.98]',
        full ? 'w-full' : '',
        isOff
          ? 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed active:scale-100'
          : VARIANTS[variant] || VARIANTS.primary,
        className,
      ].join(' ')}
      {...rest}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={18} strokeWidth={2.4} className="shrink-0" />}
          <span className="min-w-0 truncate">{children}</span>
          {IconRight && <IconRight size={18} strokeWidth={2.4} className="shrink-0" />}
        </>
      )}
    </button>
  );
}