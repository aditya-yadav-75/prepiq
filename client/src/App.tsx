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

const MainApp: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [nav, setNav] = useState<NavigationState>({ page: 'landing' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = (page: string, params?: any) => {
    setNav({ page, params });
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
        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar
            currentPage={nav.page}
            onNavigate={navigate}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Body */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
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
