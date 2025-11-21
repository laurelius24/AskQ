

import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Feed } from './pages/Feed';
import { AskQuestion } from './pages/AskQuestion';
import { Profile } from './pages/Profile';
import { PublicProfile } from './pages/PublicProfile';
import { LocationSelect } from './pages/LocationSelect';
import { QuestionDetail } from './pages/QuestionDetail';
import { Shop } from './pages/Shop';
import { Search } from './pages/Search';
import { Onboarding } from './pages/Onboarding';
import { Settings } from './pages/Settings';
import { Tasks } from './pages/Tasks';
import { WalletStars } from './pages/WalletStars';
import { WalletBlast } from './pages/WalletBlast';
import { SelectLocationForQuestion } from './pages/SelectLocationForQuestion';
import { SelectCategoryForQuestion } from './pages/SelectCategoryForQuestion';
import { Inventory } from './pages/Inventory';
import { useStore } from './store';
import { Globe } from 'lucide-react';

// --- Telegram Navigation Sync Component ---
const TelegramNavigator = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        const tg = window.Telegram?.WebApp;
        if (!tg) return;

        // 1. Force Fullscreen
        tg.ready();
        tg.expand();
        tg.setHeaderColor('#000000');
        tg.setBackgroundColor('#000000');

        // 2. Handle Native Back Button
        const handleBack = () => {
            navigate(-1);
        };

        // Show back button if not on main tabs or root
        // Main tabs: '/', '/search', '/shop', '/profile'
        const mainRoutes = ['/', '/search', '/shop', '/profile'];
        if (!mainRoutes.includes(location.pathname)) {
            tg.BackButton.show();
            tg.BackButton.onClick(handleBack);
        } else {
            tg.BackButton.hide();
            tg.BackButton.offClick(handleBack);
        }

        return () => {
            tg.BackButton.offClick(handleBack);
        };
    }, [location, navigate]);

    return null;
};

// Wrapper for authenticated routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/onboarding');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    return <>{children}</>;
};

// FIXED: Defined OUTSIDE of App to prevent re-definition on every render
const MainLayoutWrapper = () => {
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/search" element={<Search />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/user/:userId" element={<PublicProfile />} />
                <Route path="/shop" element={<Shop />} />
            </Routes>
        </Layout>
    );
};

const App: React.FC = () => {
  const { initializeListeners, isLoading } = useStore();

  // Initialize Listeners
  useEffect(() => {
      initializeListeners();
  }, [initializeListeners]);

  // Global Loading State - Prevent rendering routes until we know auth state
  if (isLoading) {
      return (
          <div className="h-screen w-full bg-bg flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 animate-pulse">
                  <Globe size={32} className="text-white" />
              </div>
              <div className="font-bold text-lg tracking-wider">AskQ</div>
          </div>
      );
  }

  return (
    <HashRouter>
        <TelegramNavigator />
        <Routes>
            {/* Public / Onboarding Route */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Settings & Location */}
            <Route path="/location" element={
                <ProtectedRoute>
                    <LocationSelect />
                </ProtectedRoute>
            } />
            
             <Route path="/settings" element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            } />

            {/* Wallet Routes */}
            <Route path="/wallet/stars" element={
                <ProtectedRoute>
                    <WalletStars />
                </ProtectedRoute>
            } />

            <Route path="/wallet/blast" element={
                <ProtectedRoute>
                    <WalletBlast />
                </ProtectedRoute>
            } />

            <Route path="/inventory" element={
                <ProtectedRoute>
                    <Inventory />
                </ProtectedRoute>
            } />

            {/* Standalone Pages (Full Screen) */}
            <Route path="/ask" element={
                <ProtectedRoute>
                    <AskQuestion />
                </ProtectedRoute>
            } />

            <Route path="/ask/location" element={
                <ProtectedRoute>
                    <SelectLocationForQuestion />
                </ProtectedRoute>
            } />

            <Route path="/ask/category" element={
                <ProtectedRoute>
                    <SelectCategoryForQuestion />
                </ProtectedRoute>
            } />

            <Route path="/tasks" element={
                <ProtectedRoute>
                    <Tasks />
                </ProtectedRoute>
            } />

            <Route path="/question/:id" element={
                <ProtectedRoute>
                    <QuestionDetail />
                </ProtectedRoute>
            } />

            {/* Main App Routes wrapped in Layout and Protection */}
            <Route path="/*" element={
                <ProtectedRoute>
                    <MainLayoutWrapper />
                </ProtectedRoute>
            } />
        </Routes>
    </HashRouter>
  );
};

export default App;