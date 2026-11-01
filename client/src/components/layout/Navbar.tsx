import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useAuth } from '../../context/AuthContext.js';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const handleLaunch = () => {
    if (user) {
      onNavigate('dashboard');
    } else {
      onNavigate('login');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#070E28]/90 backdrop-blur-md border-b border-slate-200/70 dark:border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
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
            <span className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-neon-lime text-navy-deep rounded-md tracking-wider">
              AI
            </span>
          </div>
        </div>

        {/* Right: Clean SaaS Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onNavigate('login')}
            className="px-3.5 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-cobalt dark:hover:text-neon-lime rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-all"
          >
            Login
          </button>
          <Button
            variant="lime"
            size="sm"
            onClick={handleLaunch}
            icon={<Sparkles className="w-4 h-4 text-navy-deep" />}
            className="shadow-xs font-bold"
          >
            Launch App
          </Button>
        </div>
      </div>
    </header>
  );
};
