import React from 'react';

interface LiquidGlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const LiquidGlassToggle: React.FC<LiquidGlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  icon,
  size = 'md',
  disabled = false,
  className = ''
}) => {
  // Exact pixel-perfect dimensions guaranteeing thumb is always contained with zero overflow
  const dimensions = {
    sm: { 
      track: 'w-10 h-[22px] p-[2px]', 
      thumb: 'w-4 h-4', 
      translate: 'translate-x-[18px]' 
    },
    md: { 
      track: 'w-12 h-[26px] p-[2px]', 
      thumb: 'w-5 h-5', 
      translate: 'translate-x-[22px]' 
    },
    lg: { 
      track: 'w-14 h-[30px] p-[3px]', 
      thumb: 'w-[22px] h-[22px]', 
      translate: 'translate-x-[24px]' 
    }
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`inline-flex items-center justify-between gap-3 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      role="switch"
      aria-checked={checked}
    >
      {(label || description) && (
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="text-cobalt dark:text-neon-lime shrink-0">{icon}</span>}
          <div>
            {label && (
              <p className="text-xs sm:text-sm font-bold text-darkText dark:text-slate-100 group-hover:text-cobalt dark:group-hover:text-neon-lime transition-colors">
                {label}
              </p>
            )}
            {description && (
              <p className="text-[11px] text-mutedText dark:text-slate-400 leading-tight">
                {description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Track */}
      <div
        className={`
          relative ${dimensions.track} rounded-full transition-all duration-300 ease-out shrink-0 flex items-center
          liquid-toggle-track ${checked ? 'active' : ''}
        `}
      >
        {/* Specular highlight strip on track */}
        <div className="absolute inset-x-2 top-0.5 h-0.5 rounded-full bg-white/40 pointer-events-none" />

        {/* Thumb */}
        <div
          className={`
            ${dimensions.thumb} rounded-full transform transition-all duration-300 cubic-bezier(0.34, 1.56, 0.64, 1) shrink-0
            liquid-toggle-thumb ${checked ? `active ${dimensions.translate}` : 'translate-x-0'}
            flex items-center justify-center
          `}
        >
          {/* Subtle specular dot on thumb */}
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 shadow-xs pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
