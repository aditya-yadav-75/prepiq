import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  variant?: 'cobalt' | 'lime' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  variant = 'gradient',
  size = 'md',
  showLabel = false,
  className = ''
}) => {
  const clamped = Math.min(Math.max(progress, 0), 100);

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[size];

  let barStyles = 'bg-gradient-to-r from-cobalt via-electric to-neon-lime';
  if (variant === 'cobalt') barStyles = 'bg-cobalt';
  if (variant === 'lime') barStyles = 'bg-neon-lime';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-mutedText mb-1.5">
          <span>Progress</span>
          <span className="text-darkText font-bold">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${heightStyles} p-0.5`}>
        <div
          className={`${heightStyles} rounded-full transition-all duration-500 ease-out ${barStyles}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
