import React from 'react';
import { Home, Package, Plus } from 'lucide-react';
import { useCraft } from '../context/CraftContext';

const TABS = [
  { step: 2,  icon: Home,    key: 'navHome' },
  { step: 10, icon: Package, key: 'navShop' },
];

export default function BottomNav() {
   const { currentStep, goToStep, t } = useCraft();

  return (
    <nav className="relative z-20 flex h-[72px] shrink-0 items-stretch border-t border-stone-200/70 bg-white/95 backdrop-blur-md">
        {TABS.map(({ step, icon: Icon, key }, i) => {
        const active = currentStep === step;
        return (
          <React.Fragment key={step}>
            <button
              onClick={() => goToStep(step)}
                       className={`flex flex-1 flex-col items-center justify-center gap-1.5 transition ${
                active ? 'text-terracotta' : 'text-stone-400'
              }`}
            >
              <Icon size={21} strokeWidth={active ? 2.7 : 2.1} />
              <span className={`text-[11px] leading-none ${active ? 'font-black' : 'font-semibold'}`}>
                {t[key]}
              </span>
            </button>
            {i === 0 && (
              <div className="relative w-20 shrink-0">
                <button
                  onClick={() => goToStep(3)}
                  aria-label="नया शिल्प जोड़ें"
                  className="absolute left-1/2 top-0 flex h-[58px] w-[58px] -translate-x-1/2 -translate-y-5 items-center justify-center rounded-3xl bg-craft text-white shadow-lift ring-4 ring-white transition active:scale-95"
                >
                  <Plus size={26} strokeWidth={2.8} />
                </button>
                <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-black text-terracotta">
                   {t.navNew}
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}