// components/ui/IndiaFlag.jsx — new file
import React from 'react';

export default function IndiaFlag({ size = 24 }) {
  const width = size * 1.5;
  return (
    <svg width={width} height={size} viewBox="0 0 150 100" xmlns="http://www.w3.org/2000/svg" className="rounded-[2px] shadow-sm">
      <rect width="150" height="33.3" y="0" fill="#FF9933" />
      <rect width="150" height="33.3" y="33.3" fill="#FFFFFF" />
      <rect width="150" height="33.4" y="66.6" fill="#138808" />
      <circle cx="75" cy="50" r="13" fill="none" stroke="#000080" strokeWidth="1.5" />
      <circle cx="75" cy="50" r="1.5" fill="#000080" />
      {Array.from({ length: 24 }).map((_, i) => {
        const angle = (i * 15 * Math.PI) / 180;
        const x2 = 75 + 13 * Math.cos(angle);
        const y2 = 50 + 13 * Math.sin(angle);
        return <line key={i} x1="75" y1="50" x2={x2} y2={y2} stroke="#000080" strokeWidth="0.6" />;
      })}
    </svg>
  );
}