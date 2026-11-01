import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  geminiKey: string;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
    const initializeAuth = async () => {
      const storedKey = localStorage.getItem('prepiq_gemini_key') || '';
      setGeminiKey(storedKey);

      // Inspect persistent (localStorage) or session-based (sessionStorage) JWT token
      const persistentToken = localStorage.getItem('prepiq_token');
      const sessionToken = sessionStorage.getItem('prepiq_token');
      const token = persistentToken || sessionToken;

      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // Cryptographically validate session against backend /api/auth/me
        const verifiedUser = await api.getCurrentUser();
        setUser(verifiedUser);
        if (persistentToken) {
          localStorage.setItem('prepiq_user', JSON.stringify(verifiedUser));
        } else {
          sessionStorage.setItem('prepiq_user', JSON.stringify(verifiedUser));
        }
      } catch (err) {
        console.warn('Session verification failed; invalidating stored credentials');
        localStorage.removeItem('prepiq_token');
        localStorage.removeItem('prepiq_user');
        sessionStorage.removeItem('prepiq_token');
        sessionStorage.removeItem('prepiq_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = true) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password, rememberMe);
      setUser(res.user);

      if (rememberMe) {
        localStorage.setItem('prepiq_token', res.token);
        localStorage.setItem('prepiq_user', JSON.stringify(res.user));
        sessionStorage.removeItem('prepiq_token');
        sessionStorage.removeItem('prepiq_user');
      } else {
        sessionStorage.setItem('prepiq_token', res.token);
        sessionStorage.setItem('prepiq_user', JSON.stringify(res.user));
        localStorage.removeItem('prepiq_token');
        localStorage.removeItem('prepiq_user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password?: string; college?: string; course?: string; year_of_study?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      localStorage.setItem('prepiq_token', res.token);
      localStorage.setItem('prepiq_user', JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prepiq_token');
    localStorage.removeItem('prepiq_user');
    sessionStorage.removeItem('prepiq_token');
    sessionStorage.removeItem('prepiq_user');
    sessionStorage.removeItem('prepiq_active_page');
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updated = await api.updateProfile(data);
    setUser(updated);
    if (localStorage.getItem('prepiq_token')) {
      localStorage.setItem('prepiq_user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('prepiq_user', JSON.stringify(updated));
    }
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
