import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Mail, Lock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { api } from '../services/api.js';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setIsLoading(true);
    try {
      await login(email, password, rememberMe);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    if (!email || !email.trim()) {
      setError('Please enter your registered email address above first.');
      return;
    }
    setIsResetting(true);
    try {
      const res = await api.forgotPassword(email);
      setStatusMessage(res.message);
    } catch (err: any) {
      setError(err.message || 'Unable to submit password reset request.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 pt-24 pb-12 sm:pt-28">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div 
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 cursor-pointer group mb-1 select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-cobalt flex items-center justify-center shadow-md shadow-cobalt/30 group-hover:scale-105 transition-transform duration-200">
              <span className="text-neon-lime font-black text-2xl tracking-tighter">P</span>
              <span className="text-white font-black text-2xl tracking-tighter">Q</span>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-darkText dark:text-white tracking-tight leading-none block">PrepIQ</span>
              <span className="text-[10px] font-bold text-cobalt dark:text-neon-lime uppercase tracking-widest block">AI Exam Engine</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-darkText dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            Sign in to access your AI exams, notes, and performance history.
          </p>
        </div>

        {/* Login Card */}
        <GlassCard className="p-7 sm:p-8 space-y-5 border border-white/90 dark:border-white/10 shadow-glass">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {error}
            </div>
          )}

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-cobalt dark:text-blue-300 font-medium flex items-start gap-2.5">
              <Info className="w-4 h-4 shrink-0 text-cobalt dark:text-blue-400 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@prepiq.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-xs font-semibold text-cobalt dark:text-neon-lime hover:underline"
                >
                  {isResetting ? 'Submitting...' : 'Forgot?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-darkText dark:hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-mutedText dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-cobalt focus:ring-cobalt"
                />
                <span>Remember this device</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full font-bold shadow-xs"
            >
              Sign In to PrepIQ
            </Button>
          </form>
        </GlassCard>

        {/* Link to register */}
        <p className="text-center text-xs text-mutedText dark:text-slate-400">
          Don't have an account yet?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-cobalt dark:text-neon-lime hover:underline"
          >
            Create your account
          </button>
        </p>
      </div>
    </div>
  );
};
