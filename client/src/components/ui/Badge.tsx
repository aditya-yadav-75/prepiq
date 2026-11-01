import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cobalt' | 'lime' | 'emerald' | 'amber' | 'rose' | 'slate' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'cobalt',
  size = 'md',
  className = '',
  icon
}) => {
  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  let variantStyles = 'bg-cobalt/10 text-cobalt border border-cobalt/20 dark:bg-cobalt/20 dark:text-electric dark:border-cobalt/40';

  if (variant === 'lime') {
    variantStyles = 'bg-neon-lime text-navy-deep font-bold border border-neon-lime shadow-sm';
  } else if (variant === 'emerald') {
    variantStyles = 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60';
  } else if (variant === 'amber') {
    variantStyles = 'bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60';
  } else if (variant === 'rose') {
    variantStyles = 'bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60';
  } else if (variant === 'slate') {
    variantStyles = 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:border-slate-700/60';
  } else if (variant === 'outline') {
    variantStyles = 'bg-white/60 text-darkText border border-slate-300 dark:bg-slate-900/60 dark:text-slate-200 dark:border-slate-700';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full tracking-wide ${sizeStyles} ${variantStyles} ${className}`}>
      {icon && <span className="inline-flex">{icon}</span>}
      {children}
    </span>
  );
};
