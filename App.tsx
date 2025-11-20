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
  return (
    <HashRouter>
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