import React from 'react';

export interface SegmentedOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface LiquidGlassSegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const LiquidGlassSegmented: React.FC<LiquidGlassSegmentedProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className = ''
}) => {
  const pad = size === 'sm' ? 'p-1' : 'p-1.5';
  const itemPad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs sm:text-sm';

  return (
    <div className={`relative inline-flex items-center rounded-2xl liquid-segmented-container ${pad} ${className}`}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              relative z-10 flex items-center justify-center gap-1.5 rounded-xl font-bold transition-all duration-200 select-none
              ${itemPad}
              ${isSelected 
                ? 'liquid-segmented-active text-navy-deep dark:text-white' 
                : 'text-mutedText dark:text-slate-400 hover:text-darkText dark:hover:text-slate-200'}
            `}
          >
            {option.icon && (
              <span className={`transition-transform duration-200 ${isSelected ? 'scale-110 text-cobalt dark:text-neon-lime' : ''}`}>
                {option.icon}
              </span>
            )}
            <span>{option.label}</span>
            {option.badge && (
              <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                isSelected 
                  ? 'bg-neon-lime text-navy-deep' 
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
