import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';

// Pages
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { UploadPage } from './pages/UploadPage.js';
import { GeneratorPage } from './pages/GeneratorPage.js';
import { PracticeTestPage } from './pages/PracticeTestPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { MyTestsPage } from './pages/MyTestsPage.js';
import { StudyMaterialsPage } from './pages/StudyMaterialsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { PromptLabPage } from './pages/PromptLabPage.js';
import { TestSuitePage } from './pages/TestSuitePage.js';
import { WorkflowDiagramPage } from './pages/WorkflowDiagramPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

interface NavigationState {
  page: string;
  params?: any;
}

const getInitialNav = (): NavigationState => {
  // Check for verified JWT token in localStorage (rememberMe) or sessionStorage
  const token = localStorage.getItem('prepiq_token') || sessionStorage.getItem('prepiq_token');
  if (token) {
    const savedPage = sessionStorage.getItem('prepiq_active_page');
    const validPages = [
      'dashboard', 'upload', 'generate', 'test', 'results',
      'tests', 'materials', 'analytics', 'prompts',
      'test-suite', 'workflow', 'settings'
    ];
    if (savedPage && validPages.includes(savedPage)) {
      return { page: savedPage };
    }
    return { page: 'dashboard' };
  }
  return { page: 'landing' };
};

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [nav, setNav] = useState<NavigationState>(getInitialNav);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = (page: string, params?: any) => {
    setNav({ page, params });
    const isPublic = page === 'landing' || page === 'login' || page === 'register';
    if (!isPublic) {
      sessionStorage.setItem('prepiq_active_page', page);
    } else {
      sessionStorage.removeItem('prepiq_active_page');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicPage = nav.page === 'landing' || nav.page === 'login' || nav.page === 'register';

  // Protect authenticated routes: redirect unauthenticated users to login
  React.useEffect(() => {
    if (!isLoading && !user && !isPublicPage) {
      setNav({ page: 'login' });
    }
  }, [user, isLoading, isPublicPage]);

  return (
    <div className="min-h-screen bg-softBg dark:bg-darkBg text-darkText dark:text-slate-100 font-sans flex flex-col selection:bg-neon-lime selection:text-navy-deep transition-colors duration-300">
      {/* PUBLIC NAVBAR */}
      {isPublicPage ? (
        <>
          <Navbar onNavigate={navigate} currentPage={nav.page} />
          <main className="flex-1">
            {nav.page === 'landing' && <LandingPage onNavigate={navigate} />}
            {nav.page === 'login' && <LoginPage onNavigate={navigate} />}
            {nav.page === 'register' && <RegisterPage onNavigate={navigate} />}
          </main>
        </>
      ) : (
        /* AUTHENTICATED DASHBOARD LAYOUT */
        <div className="flex flex-1 relative min-h-screen">
          {/* Subtle Apple-style atmospheric light blooms for Liquid Glass refraction */}
          <div className="fixed top-0 left-0 w-[550px] h-[350px] bg-gradient-to-br from-cobalt/[0.05] via-electric/[0.02] to-transparent dark:from-cobalt/[0.12] dark:via-electric/[0.05] blur-[130px] rounded-full pointer-events-none -z-10" />
          <div className="fixed top-36 right-10 w-[450px] h-[320px] bg-gradient-to-bl from-neon-lime/[0.04] via-cobalt/[0.02] to-transparent dark:from-neon-lime/[0.08] dark:via-cobalt/[0.05] blur-[140px] rounded-full pointer-events-none -z-10" />
          <div className="fixed bottom-10 left-1/4 w-[600px] h-[350px] bg-gradient-to-tr from-electric/[0.02] to-transparent dark:from-cobalt/[0.07] blur-[150px] rounded-full pointer-events-none -z-10" />

          {/* Sidebar */}
          <Sidebar
            currentPage={nav.page}
            onNavigate={navigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Body */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72 relative z-0">
            <Header
              onOpenSidebar={() => setIsSidebarOpen(true)}
              onNavigate={navigate}
            />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full animate-fade-in">
              {nav.page === 'dashboard' && <DashboardPage onNavigate={navigate} />}
              {nav.page === 'upload' && <UploadPage onNavigate={navigate} />}
              {nav.page === 'generate' && (
                <GeneratorPage
                  initialDocumentId={nav.params?.documentId}
                  onNavigate={navigate}
                />
              )}
              {nav.page === 'test' && (
                <PracticeTestPage
                  testId={nav.params?.testId || 'test-demo-os-01'}
                  onNavigate={navigate}
                />
              )}
              {nav.page === 'results' && (
                <ResultsPage
                  attemptId={nav.params?.attemptId || 'att-demo-001'}
                  onNavigate={navigate}
                />
              )}
              {nav.page === 'tests' && <MyTestsPage onNavigate={navigate} />}
              {nav.page === 'materials' && <StudyMaterialsPage onNavigate={navigate} />}
              {nav.page === 'analytics' && <AnalyticsPage onNavigate={navigate} />}
              {nav.page === 'prompts' && <PromptLabPage onNavigate={navigate} />}
              {nav.page === 'test-suite' && <TestSuitePage />}
              {nav.page === 'workflow' && <WorkflowDiagramPage onNavigate={navigate} />}
              {nav.page === 'settings' && <SettingsPage onNavigate={navigate} />}
            </main>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
