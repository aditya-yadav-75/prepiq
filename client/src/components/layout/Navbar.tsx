import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user } = useAuth();

  const handleLaunch = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      onNavigate('login');
    }
  };

  return (
    <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl transition-all duration-300">
      <nav 
        className="
          flex items-center justify-between px-4 sm:px-6 py-2.5 sm:py-3
          rounded-full
          liquid-glass-floating-pill
          transition-all
        "
        aria-label="Public Navigation"
      >
        {/* Left: Brand Identity */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-cobalt flex items-center justify-center shadow-md shadow-cobalt/25 group-hover:scale-105 transition-transform duration-200">
            <span className="text-neon-lime font-black text-lg tracking-tighter">P</span>
            <span className="text-white font-black text-lg tracking-tighter">Q</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-darkText dark:text-white">
              Prep<span className="text-cobalt dark:text-neon-lime">IQ</span>
            </span>
            <span className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-neon-lime text-navy-deep rounded-md tracking-wider shadow-xs">
              AI
            </span>
          </div>
        </div>

        {/* Right: Clean SaaS Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('login')}
            className={`
              px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all
              ${currentPage === 'login'
                ? 'bg-white/40 dark:bg-white/10 text-cobalt dark:text-neon-lime shadow-xs border border-white/40 dark:border-white/10'
                : 'text-darkText dark:text-slate-200 hover:text-cobalt dark:hover:text-neon-lime hover:bg-white/30 dark:hover:bg-white/5'}
            `}
          >
            Login
          </button>
          <Button
            variant="lime"
            size="sm"
            onClick={handleLaunch}
            icon={<Sparkles className="w-3.5 h-3.5 text-navy-deep" />}
            className="rounded-full shadow-xs font-bold text-xs sm:text-sm px-4 py-1.5"
          >
            Launch App
          </Button>
        </div>
      </nav>
    </header>
  );
};
