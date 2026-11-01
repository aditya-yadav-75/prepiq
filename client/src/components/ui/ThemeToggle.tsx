import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.js';
import { LiquidGlassSegmented } from './LiquidGlassSegmented.js';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'compact',
  className = ''
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <LiquidGlassSegmented
        options={[
          { value: 'light', label: 'Light', icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
          { value: 'dark', label: 'Dark', icon: <Moon className="w-3.5 h-3.5 text-electric" /> },
          { value: 'system', label: 'Auto', icon: <Laptop className="w-3.5 h-3.5 text-slate-400" /> }
        ]}
        value={theme}
        onChange={(val) => setTheme(val as any)}
        size="sm"
        className={className}
      />
    );
  }

  // Compact liquid glass pill toggle
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-xl transition-all duration-300
        glass-pill hover:scale-105 active:scale-95
        dark:bg-slate-800/80 dark:border-white/10 dark:hover:bg-slate-700/80
        flex items-center justify-center text-darkText dark:text-slate-100 shadow-xs
        ${className}
      `}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
    >
      <div className="relative w-4 h-4">
        <Sun className={`w-4 h-4 text-amber-500 absolute inset-0 transform transition-all duration-300 ${
          isDark ? 'rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
        }`} />
        <Moon className={`w-4 h-4 text-neon-lime absolute inset-0 transform transition-all duration-300 ${
          isDark ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-50'
        }`} />
      </div>
    </button>
  );
};
