import React from 'react';

const TONES = {
  default: 'bg-white border-stone-200/90',
  warm:    'bg-gradient-to-br from-mustard-50 to-terracotta-50 border-mustard-200',
  clay:    'bg-terracotta-50 border-terracotta-200',
  leaf:    'bg-forest-50 border-forest-200',
  ghost:   'bg-white/60 border-stone-200/70 backdrop-blur-sm',
  alert:   'bg-amber-50 border-amber-200',
};

export default function Card({
  children,
  className = '',
  tone = 'default',
  padded = true,
  interactive = false,
  as: Tag = 'div',
  ...rest
}) {
  return (
    <Tag
      className={[
        'rounded-3xl border shadow-card',
        TONES[tone] || TONES.default,
        padded ? 'p-4' : '',
        interactive ? 'tap cursor-pointer hover:shadow-lift hover:-translate-y-0.5' : '',
        'transition-[box-shadow,transform] duration-200',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
}