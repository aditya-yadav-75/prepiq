import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Code2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose
}) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'generate', label: 'Generate Practice Test', icon: Sparkles, highlight: true },
    { id: 'tests', label: 'My Tests', icon: FileText },
    { id: 'materials', label: 'Study Materials', icon: BookOpen },
    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
    { id: 'prompts', label: 'Prompt Engineering Lab', icon: Code2 },
    { id: 'test-suite', label: 'Validation Test Suite', icon: ShieldCheck },
    { id: 'workflow', label: 'Workflow & Architecture', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-navy-deep/60 dark:bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-72 
        bg-white/85 dark:bg-[#070E28]/90 backdrop-blur-glass-heavy border-r border-slate-200/80 dark:border-white/10 shadow-glass dark:shadow-glass-dark
        flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-white/10">
          <div 
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-cobalt flex items-center justify-center shadow-md shadow-cobalt/30 group-hover:scale-105 transition-transform duration-200">
              <span className="text-neon-lime font-black text-xl tracking-tighter">P</span>
              <span className="text-white font-black text-xl tracking-tighter">Q</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-darkText dark:text-white">Prep<span className="text-cobalt dark:text-neon-lime">IQ</span></span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase bg-neon-lime text-navy-deep rounded-md">PRO</span>
              </div>
              <p className="text-[11px] font-medium text-mutedText dark:text-slate-400">Exam Generator</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-darkText dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-mutedText dark:text-slate-500">
            Core Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-left
                  ${isActive 
                    ? 'bg-cobalt text-white shadow-md shadow-cobalt/25 dark:shadow-glow-blue' 
                    : item.highlight
                    ? 'bg-neon-lime/20 dark:bg-neon-lime/10 text-navy-deep dark:text-neon-lime border border-neon-lime/40 dark:border-neon-lime/20 hover:bg-neon-lime/30'
                    : 'text-darkText dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-cobalt dark:hover:text-white'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neon-lime' : item.highlight ? 'text-cobalt dark:text-neon-lime' : 'text-mutedText dark:text-slate-400'}`} />
                <span className="truncate flex-1">{item.label}</span>
                {item.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-neon-lime animate-pulse" />
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/70 dark:border-white/10 mb-2">
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm"
              style={{ backgroundColor: user?.avatar_color || '#1649E8' }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-darkText dark:text-white truncate">{user?.name || 'Student'}</p>
              <p className="text-[11px] text-mutedText dark:text-slate-400 truncate">{user?.course || 'Computer Science'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              handleNav('landing');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
