const can = () => typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

export const haptic = {
  tap:     () => { if (can()) navigator.vibrate(8); },
  select:  () => { if (can()) navigator.vibrate(12); },
  success: () => { if (can()) navigator.vibrate([14, 45, 26]); },
  warn:    () => { if (can()) navigator.vibrate([18, 60, 18]); },
};

/** Fires a light tap on every pressable element, app-wide. Call once at boot. */
export function installGlobalHaptics() {
  if (!can()) return;
  document.addEventListener(
    'pointerdown',
    (e) => {
      const el = e.target?.closest?.('button, a, [role="button"], label.tap, input[type="range"]');
      if (el && !el.disabled) haptic.tap();
    },
    { passive: true }
  );
}