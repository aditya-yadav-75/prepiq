import React, { useState } from 'react';
import { 
  Settings, 
  Key, 
  User, 
  Database, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Cpu, 
  Sparkles,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { api } from '../services/api.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { Badge } from '../components/ui/Badge.js';
import { Button } from '../components/ui/Button.js';
import { LiquidGlassSegmented } from '../components/ui/LiquidGlassSegmented.js';

interface SettingsPageProps {
  onNavigate: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const { user, geminiKey, saveGeminiKey, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [course, setCourse] = useState(user?.course || '');
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study || '3rd Year');

  const [apiKeyInput, setApiKeyInput] = useState(geminiKey);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateUser({ name, college, course, year_of_study: yearOfStudy });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveApiKey = () => {
    saveGeminiKey(apiKeyInput);
    setKeyTestResult(null);
    alert('Gemini API Key saved to your local browser session.');
  };

  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      alert('Please enter an API key first');
      return;
    }
    setIsTestingKey(true);
    try {
      const res = await api.testGeminiKey(apiKeyInput.trim());
      setKeyTestResult(res);
      if (res.success) {
        saveGeminiKey(apiKeyInput.trim());
      }
    } catch (err: any) {
      setKeyTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all exams, documents, and attempts to the initial demonstration state?')) return;
    setIsResetting(true);
    try {
      await api.resetDemoData();
      alert('Database successfully restored to clean demonstration state with pre-loaded Operating Systems and Machine Learning exams.');
      window.location.reload();
    } catch (err) {
      alert('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-darkText dark:text-white tracking-tight">
          Application & Profile Settings
        </h2>
        <p className="text-xs sm:text-sm text-mutedText dark:text-slate-400">
          Configure visual themes, Google Gemini AI connection, student profile details, and data storage.
        </p>
      </div>

      {/* SECTION 1: APPEARANCE & LIQUID GLASS THEME TOGGLER */}
      <GlassCard className="p-6 sm:p-8 space-y-5 border border-white/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-lime/20 text-navy-deep flex items-center justify-center shadow-xs">
              <Sun className="w-5 h-5 text-cobalt dark:text-neon-lime" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-darkText dark:text-white">Appearance & Theme Mode</h3>
                <Badge variant="lime" size="sm">Liquid Glass UI</Badge>
              </div>
              <p className="text-xs text-mutedText dark:text-slate-400">
                Choose between Apple-inspired Liquid Glass light mode, midnight obsidian dark mode, or system auto.
              </p>
            </div>
          </div>

          <LiquidGlassSegmented
            options={[
              { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4 text-amber-500" /> },
              { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 text-electric" /> },
              { value: 'system', label: 'System', icon: <Laptop className="w-4 h-4 text-slate-400" /> }
            ]}
            value={theme}
            onChange={(val) => setTheme(val as any)}
            size="md"
          />
        </div>
      </GlassCard>

      {/* SECTION 2: GEMINI API CONFIGURATION */}
      <GlassCard className="p-6 sm:p-8 space-y-5 border border-white/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cobalt text-neon-lime flex items-center justify-center shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-darkText dark:text-white">Google Gemini API Configuration</h3>
                <Badge variant={geminiKey ? 'emerald' : 'slate'} size="sm">
                  {geminiKey ? 'Active Key' : 'Local Hybrid Engine Active'}
                </Badge>
              </div>
              <p className="text-xs text-mutedText dark:text-slate-400">
                Configure your own Google Gemini API key to run live cloud question synthesis.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400">
            Google Gemini API Key
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs sm:text-sm font-mono text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestApiKey}
              isLoading={isTestingKey}
            >
              Test Connection
            </Button>
            <Button
              variant="lime"
              size="sm"
              onClick={handleSaveApiKey}
            >
              Save Key
            </Button>
          </div>

          {keyTestResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              keyTestResult.success 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
            }`}>
              {keyTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{keyTestResult.message}</span>
            </div>
          )}

          <p className="text-[11px] text-mutedText dark:text-slate-400 leading-relaxed">
            Note: If left empty, PrepIQ operates seamlessly in high-fidelity local semantic mode, so you can test and demonstrate the entire platform offline without external dependencies.
          </p>
        </div>
      </GlassCard>

      {/* SECTION 3: STUDENT PROFILE */}
      <GlassCard className="p-6 sm:p-8 space-y-5 border border-white/90">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-cobalt dark:text-neon-lime flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-darkText dark:text-white">Student Profile Details</h3>
            <p className="text-xs text-mutedText dark:text-slate-400">Associated with generated examinations and analytics</p>
          </div>
        </div>

        {profileSaved && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-sm font-medium text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-mutedText dark:text-slate-400 mb-1.5">Course / Department</label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-sm font-medium text-darkText dark:text-white focus:ring-2 focus:ring-cobalt focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSavingProfile}
            >
              Update Profile
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* SECTION 4: STORAGE & DEMO RESET */}
      <GlassCard className="p-6 sm:p-8 space-y-5 border border-white/90">
        <div className="flex items-center gap-3 pb-2 border-b border-slate-100 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-cobalt dark:text-neon-lime flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-darkText dark:text-white">Database & Demonstration Reset</h3>
            <p className="text-xs text-mutedText dark:text-slate-400">Manage persistence state and demo data</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10">
          <div>
            <p className="text-xs font-bold text-darkText dark:text-white">Reset to Default Demonstration State</p>
            <p className="text-[11px] text-mutedText dark:text-slate-400 mt-0.5">
              Restores pre-populated Operating Systems and Machine Learning study materials and completed attempts.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            isLoading={isResetting}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset Demo Data
          </Button>
        </div>

        <div className="pt-2 flex justify-between items-center text-xs">
          <button
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
          <span className="text-mutedText dark:text-slate-400">PrepIQ v2.0 • Liquid Glass Edition</span>
        </div>
      </GlassCard>
    </div>
  );
};
