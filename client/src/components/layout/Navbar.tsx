import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { ThemeToggle } from '../ui/ThemeToggle.js';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  return (
    <header className="sticky top-4 z-40 px-4 max-w-7xl mx-auto">
      <nav className="glass-card rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/80 dark:border-white/10 shadow-glass dark:shadow-glass-dark">
        {/* Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-cobalt flex items-center justify-center shadow-md shadow-cobalt/30 group-hover:scale-105 transition-transform duration-200">
            <span className="text-neon-lime font-black text-xl tracking-tighter">P</span>
            <span className="text-white font-black text-xl tracking-tighter">Q</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-darkText dark:text-white">Prep<span className="text-cobalt dark:text-neon-lime">IQ</span></span>
            <span className="px-1.5 py-0.5 text-[10px] font-black uppercase bg-neon-lime text-navy-deep rounded-md tracking-wider">AI</span>
          </div>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium text-mutedText dark:text-slate-300">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'landing' ? 'text-cobalt dark:text-neon-lime font-semibold bg-cobalt/5 dark:bg-white/5' : 'hover:text-darkText dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'}`}
          >
            Overview
          </button>
          <button
            onClick={() => onNavigate('workflow')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'workflow' ? 'text-cobalt dark:text-neon-lime font-semibold bg-cobalt/5 dark:bg-white/5' : 'hover:text-darkText dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'}`}
          >
            Workflow Pipeline
          </button>
          <button
            onClick={() => onNavigate('prompts')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'prompts' ? 'text-cobalt dark:text-neon-lime font-semibold bg-cobalt/5 dark:bg-white/5' : 'hover:text-darkText dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'}`}
          >
            Prompt Lab
          </button>
          <button
            onClick={() => onNavigate('test-suite')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${currentPage === 'test-suite' ? 'text-cobalt dark:text-neon-lime font-semibold bg-cobalt/5 dark:bg-white/5' : 'hover:text-darkText dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />
            Validation Suite
          </button>
        </div>

        {/* Action Buttons & Liquid Glass Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('login')}
            className="hidden sm:inline-flex"
          >
            Log in
          </Button>
          <Button
            variant="lime"
            size="sm"
            onClick={() => onNavigate('dashboard')}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Launch App
          </Button>
        </div>
      </nav>
    </header>
  );
};
