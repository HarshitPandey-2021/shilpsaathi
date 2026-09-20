import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Sheet({ open, onClose, children }) {
  const [host, setHost] = useState(null);

  useEffect(() => {
    setHost(document.getElementById('sheet-root'));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !host) return null;

  return createPortal(
    <div
      className="absolute inset-0 z-[80] flex items-end bg-charcoal/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-h-[88%] w-full overflow-y-auto scrollbar-hide rounded-t-[2rem] bg-white pb-8 animate-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    host
  );
}