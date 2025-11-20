import React, { useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Compass, Plus, User, Search, Ticket } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, saveScrollPosition, savedScrollPositions } = useStore();
  const t = translations[language];
  const mainRef = useRef<HTMLDivElement>(null);

  // Restore Scroll Position logic
  useEffect(() => {
    const currentPath = location.pathname;
    const savedPos = savedScrollPositions[currentPath] || 0;
    
    if (mainRef.current) {
        mainRef.current.scrollTo(0, savedPos);
    }

    // Save scroll position before unmounting or changing path
    return () => {
        if (mainRef.current) {
            saveScrollPosition(currentPath, mainRef.current.scrollTop);
        }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Removed savedScrollPositions to prevent infinite loop

  const isActive = (path: string) => location.pathname === path;

  // Material Design 3 Style Navigation Item
  const NavItem = ({ path, icon: Icon, label }: { path: string, icon: any, label: string }) => {
      const active = isActive(path);
      return (
        <button
            onClick={() => navigate(path)}
            className="flex flex-col items-center justify-center w-1/5 gap-1 group"
        >
            <div className={`rounded-full w-16 h-8 flex items-center justify-center transition-all duration-200 ${active ? 'bg-primary/20' : 'bg-transparent'}`}>
                <Icon 
                    size={24} 
                    strokeWidth={active ? 2.5 : 1.5} 
                    className={`transition-colors ${active ? 'text-primary' : 'text-secondary'}`} 
                />
            </div>
            <span className={`text-[11px] font-medium tracking-tight transition-colors ${active ? 'text-white' : 'text-secondary'}`}>
                {label}
            </span>
        </button>
      );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-bg text-white font-sans overflow-hidden">
      {/* Main Content Area */}
      <main ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar bg-bg">
        {children}
      </main>

      {/* Bottom Navigation Bar - Material Design Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/5 pb-safe pt-2 px-2 flex justify-between items-center z-30 h-[80px]">
        
        <NavItem path="/" icon={Compass} label={t['nav.feed']} />
        <NavItem path="/search" icon={Search} label={t['nav.search']} />

        {/* Floating Action Button (FAB) Style for Add */}
        <button
          onClick={() => navigate('/ask')}
          className="w-1/5 flex flex-col items-center justify-center mb-4"
        >
            <div className="bg-primary text-white rounded-[16px] w-14 h-14 flex items-center justify-center shadow-lg shadow-primary/20 active:scale-95 transition-transform border-4 border-[#121212]">
                <Plus size={28} strokeWidth={2.5} />
            </div>
        </button>

        <NavItem path="/shop" icon={Ticket} label={t['nav.shop']} />
        <NavItem path="/profile" icon={User} label={t['nav.profile']} />

      </nav>
    </div>
  );
};