import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'cobalt' | 'lime';
  hoverEffect?: boolean;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'light',
  hoverEffect = false,
  className = '',
  ...props
}) => {
  let variantStyles = 'bg-white/80 dark:bg-[#0B1533]/80 backdrop-blur-glass border border-white/90 dark:border-white/10 shadow-glass dark:shadow-glass-dark text-darkText dark:text-slate-100';

  if (variant === 'dark') {
    variantStyles = 'bg-navy/90 dark:bg-slate-900/90 backdrop-blur-glass border border-white/15 shadow-2xl text-white';
  } else if (variant === 'cobalt') {
    variantStyles = 'bg-cobalt/90 backdrop-blur-glass border border-white/20 shadow-glow-blue text-white';
  } else if (variant === 'lime') {
    variantStyles = 'bg-neon-lime/15 dark:bg-neon-lime/10 backdrop-blur-md border border-neon-lime/40 shadow-glow-lime text-navy-deep dark:text-neon-lime';
  }

  const hoverStyles = hoverEffect 
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-glass-hover dark:hover:shadow-glass-dark-hover hover:border-cobalt/30 dark:hover:border-electric/40' 
    : '';

  return (
    <div
      className={`rounded-2xl ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
