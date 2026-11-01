import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  geminiKey: string;
  login: (email: string, password?: string, isDemo?: boolean) => Promise<void>;
  register: (data: { name: string; email: string; password?: string; college?: string; course?: string; year_of_study?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
  saveGeminiKey: (key: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [geminiKey, setGeminiKey] = useState<string>('');

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('prepiq_user');
    const storedKey = localStorage.getItem('prepiq_gemini_key') || '';
    setGeminiKey(storedKey);

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (_) {
        localStorage.removeItem('prepiq_user');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password?: string, isDemo = false) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password, isDemo);
      setUser(res.user);
      localStorage.setItem('prepiq_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password?: string; college?: string; course?: string; year_of_study?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      localStorage.setItem('prepiq_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prepiq_user');
    sessionStorage.removeItem('prepiq_active_page');
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('prepiq_user', JSON.stringify(updated));
  };

  const saveGeminiKey = (key: string) => {
    setGeminiKey(key);
    if (key.trim()) {
      localStorage.setItem('prepiq_gemini_key', key.trim());
    } else {
      localStorage.removeItem('prepiq_gemini_key');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        geminiKey,
        login,
        register,
        logout,
        updateUser,
        saveGeminiKey
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
