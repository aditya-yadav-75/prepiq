import React from 'react';
import { Menu, Bell, Sparkles, Cpu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../ui/Button.js';
import { ThemeToggle } from '../ui/ThemeToggle.js';

interface HeaderProps {
  onOpenSidebar: () => void;
  onNavigate: (page: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, onNavigate }) => {
  const { user, geminiKey } = useAuth();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 px-6 py-4 bg-softBg/85 dark:bg-[#050B1E]/85 backdrop-blur-md border-b border-slate-200/60 dark:border-white/10">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Greeting */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl text-darkText dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-darkText dark:text-white tracking-tight">
              Hello, {user?.name?.split(' ')[0] || 'Student'} <span className="inline-block animate-bounce">👋</span>
            </h2>
            <p className="text-xs font-medium text-mutedText dark:text-slate-400">{today} • Academic Workspace</p>
          </div>
        </div>

        {/* Right: AI Engine Status, Theme Toggle, Quick Action & Notifications */}
        <div className="flex items-center gap-3">
          {/* AI Model Indicator Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs text-xs font-semibold text-darkText dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-neon-lime shadow-glow-lime animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-cobalt dark:text-neon-lime" />
            <span>{geminiKey ? 'Gemini 1.5 Flash' : 'Hybrid AI Engine'}</span>
          </div>

          {/* Liquid Glass Theme Toggle */}
          <ThemeToggle />

          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('generate')}
            icon={<Sparkles className="w-3.5 h-3.5 text-neon-lime" />}
            className="hidden md:inline-flex"
          >
            Quick Generate
          </Button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-mutedText dark:text-slate-300 hover:text-darkText dark:hover:text-white border border-slate-200/80 dark:border-white/10 transition-colors shadow-xs">
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-neon-lime ring-2 ring-white dark:ring-slate-900" />
          </div>

          {/* Profile Avatar */}
          <div 
            onClick={() => onNavigate('settings')}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm cursor-pointer shadow-sm hover:ring-2 hover:ring-cobalt/30 transition-all select-none"
            style={{ backgroundColor: user?.avatar_color || '#1649E8' }}
          >
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
