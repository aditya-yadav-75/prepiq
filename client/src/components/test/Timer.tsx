import React, { useEffect, useState } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

interface TimerProps {
  totalSeconds: number;
  onTimeUp: () => void;
  onTick?: (secondsLeft: number) => void;
}

export const Timer: React.FC<TimerProps> = ({
  totalSeconds,
  onTimeUp,
  onTick
}) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (onTick) onTick(next);
        if (next <= 0) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft, onTimeUp, onTick]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isLowTime = secondsLeft < 180; // less than 3 minutes

  return (
    <div className={`
      flex items-center gap-2 px-3.5 py-2 rounded-2xl border font-mono font-bold text-sm transition-all shadow-xs
      ${isLowTime 
        ? 'bg-rose-50 text-rose-600 border-rose-300 animate-pulse' 
        : 'bg-white/80 text-darkText border-slate-200/80'}
    `}>
      {isLowTime ? (
        <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-cobalt" />
      )}
      <span>{formatted}</span>
    </div>
  );
};
