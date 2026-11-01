import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'lime' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg',
    md: 'px-4 py-2.5 text-sm font-semibold rounded-xl',
    lg: 'px-6 py-3.5 text-base font-bold rounded-2xl'
  }[size];

  let variantStyles = 'bg-cobalt hover:bg-cobalt-hover text-white shadow-md shadow-cobalt/25 active:scale-[0.98] transition-all duration-200';

  if (variant === 'lime') {
    variantStyles = 'bg-neon-lime hover:bg-neon-hover text-navy-deep font-extrabold shadow-md shadow-neon-lime/30 active:scale-[0.98] transition-all duration-200';
  } else if (variant === 'secondary') {
    variantStyles = 'bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700/90 text-darkText dark:text-slate-100 border border-slate-200/80 dark:border-white/10 shadow-sm hover:shadow active:scale-[0.98] transition-all duration-200 backdrop-blur-sm';
  } else if (variant === 'outline') {
    variantStyles = 'bg-transparent border border-cobalt/40 dark:border-cobalt/60 text-cobalt dark:text-electric hover:bg-cobalt/5 dark:hover:bg-cobalt/20 active:scale-[0.98] transition-all duration-200';
  } else if (variant === 'danger') {
    variantStyles = 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm active:scale-[0.98] transition-all duration-200';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-mutedText dark:text-slate-300 hover:text-darkText dark:hover:text-white transition-colors duration-150';
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon ? (
        <span className="inline-flex shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};
