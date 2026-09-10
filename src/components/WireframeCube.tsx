import React from 'react';

export const WireframeCube: React.FC = () => {
  return (
    <div className="hidden md:flex items-center gap-4 select-none">
      {/* Labels */}
      <div className="flex flex-col items-end text-[8px] uppercase tracking-widest text-[var(--text-muted)] font-mono leading-tight">
        <span className="border border-[var(--border-color)] px-1 py-0.5 mb-1 bg-[var(--bg-primary)]">
          ROTATION 136° // SYSTEM ACTIVE
        </span>
        <span className="opacity-80">
          X: 0.69 // Y: 1.22 // Z: 0.35
        </span>
      </div>

      {/* Wireframe Rotating Squares / Cube */}
      <div className="relative w-12 h-12 flex items-center justify-center border border-[var(--border-color)] p-1 bg-[var(--bg-card)]">
        {/* Outer rotated square */}
        <div 
          className="absolute inset-2 border border-[var(--border-color)] animate-[spin_24s_linear_infinite]"
          style={{ transformOrigin: 'center' }}
        />
        {/* Inner rotated gold square */}
        <div 
          className="absolute inset-3 border border-dashed border-[#C9A961] animate-[spin_12s_linear_infinite_reverse]"
          style={{ transformOrigin: 'center' }}
        />
        {/* Center pivot point */}
        <div className="w-1.5 h-1.5 bg-[#C9A961] z-10" />
      </div>
    </div>
  );
};
