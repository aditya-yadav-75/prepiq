import React, { useState } from 'react';
import { Sparkles, ArrowRight, User, Mail, Lock, GraduationCap, BookOpen, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { Button } from '../components/ui/Button.js';
import { GlassCard } from '../components/ui/GlassCard.js';

interface RegisterPageProps {
  onNavigate: (page: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Password must contain both letters and numbers/symbols.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the academic integrity terms.');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        college,
        course,
        year_of_study: yearOfStudy
      });
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 pt-24 pb-12 sm:pt-28">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div 
            onClick={() => onNavigate('landing')}
            className="inline-flex items-center gap-2.5 cursor-pointer group mb-1"
          >
            <div className="w-12 h-12 rounded-2xl bg-cobalt flex items-center justify-center shadow-md shadow-cobalt/30 group-hover:scale-105 transition-transform">
              <span className="text-neon-lime font-black text-2xl tracking-tighter">P</span>
              <span className="text-white font-black text-2xl tracking-tighter">Q</span>
            </div>
            <div className="text-left">
              <span className="text-xl font-black text-darkText dark:text-white tracking-tight leading-none block">PrepIQ</span>
              <span className="text-[10px] font-bold text-cobalt dark:text-neon-lime uppercase tracking-widest block">AI Exam Engine</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-darkText dark:text-white tracking-tight">
            Create your student account
          </h2>
          <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
            Join thousands of university students using PrepIQ for validated exam preparation.
          </p>
        </div>

        <GlassCard className="p-8 border border-white/90 dark:border-white/10 shadow-glass space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aditya Yadav"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                University Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aditya@apex.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  College / University
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Apex Institute"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Course / Branch
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-mutedText dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-darkText dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Year of Study
              </label>
              <select
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 dark:bg-slate-800 border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-cobalt text-darkText dark:text-white text-sm font-medium"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Postgraduate">Postgraduate / Masters</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-mutedText dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-cobalt focus:ring-cobalt shrink-0"
                />
                <span>
                  I agree to the Terms of Service, Privacy Policy, and affirm adherence to university academic integrity standards.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              Create Account & Go to Dashboard
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-xs text-mutedText dark:text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-cobalt dark:text-neon-lime hover:underline"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};
