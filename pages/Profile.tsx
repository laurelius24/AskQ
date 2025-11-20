import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Settings, Star, MessageSquare, MessageCircle, Link as LinkIcon, ChevronRight, Zap, MapPin, Ticket } from 'lucide-react';
import { translations } from '../translations';
import { LocationType } from '../types';

// Extracted MenuItem to prevent re-rendering issues and cleaner code
const MenuItem = ({ icon: Icon, label, onClick, value }: any) => (
    <button 
      onClick={onClick} 
      className="w-full flex items-center justify-between p-4 transition-colors active:bg-white/5 group"
    >
        <div className="flex items-center gap-4">
            <div className="text-secondary">
                <Icon size={20} />
            </div>
            <span className="font-medium text-white text-base">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          {value && <span className="text-sm text-secondary">{value}</span>}
          <ChevronRight size={18} className="text-secondary/50" />
        </div>
    </button>
);

export const Profile: React.FC = () => {
  const { currentUser, selectedLocation, language, questions } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  if (!currentUser) return null;

  const myQuestions = questions.filter(q => q.authorId === currentUser.id);
  const myCouponsCount = currentUser.inventory.length;

  return (
    <div className="pb-24 min-h-screen bg-bg page-transition pt-8">
       <div className="p-4 space-y-8">
            
            {/* 1. Profile Header (Avatar & Info) */}
            <div className="flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-card mb-5 relative">
                    <img src={currentUser.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{currentUser.displayName}</h2>
                <p className="text-secondary font-medium">@{currentUser.username}</p>
                
                {/* Location Pill */}
                {selectedLocation && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-card rounded-full text-sm font-bold text-secondary border border-white/5">
                         <span>{selectedLocation.type === LocationType.CITY ? <MapPin size={14} /> : selectedLocation.flagEmoji}</span>
                         <span>{selectedLocation.name}</span>
                    </div>
                )}
            </div>

            {/* 2. Finance Section */}
            <div>
                <div className="flex justify-between items-end mb-2 px-2">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">{t['prof.finance']}</span>
                </div>
                <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                    <MenuItem 
                        icon={Star} 
                        label={t['prof.wallet.stars']} 
                        value={`${currentUser.starsBalance} Stars`}
                        onClick={() => navigate('/wallet/stars')} 
                    />
                    <div className="h-px bg-white/5 mx-4"></div>
                    <MenuItem 
                        icon={Zap} 
                        label={t['prof.wallet.blast']} 
                        value={`${currentUser.walletBalance} BLAST`}
                        onClick={() => navigate('/wallet/blast')} 
                    />
                </div>
            </div>

            {/* 3. Content Section */}
            <div>
                <div className="flex justify-between items-end mb-2 px-2">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">{t['prof.my_content']}</span>
                    <span className="text-xs text-secondary">{myQuestions.length + myCouponsCount} items</span>
                </div>
                <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                    <MenuItem 
                        icon={MessageCircle} 
                        label={t['prof.tab.questions']} 
                        value={myQuestions.length}
                        onClick={() => navigate(`/user/${currentUser.id}`, { state: { initialTab: 'questions' } })} 
                    />
                    <div className="h-px bg-white/5 mx-4"></div>
                    <MenuItem 
                        icon={MessageSquare} 
                        label={t['prof.tab.answers']} 
                        value="0"
                        onClick={() => navigate(`/user/${currentUser.id}`, { state: { initialTab: 'answers' } })} 
                    />
                    <div className="h-px bg-white/5 mx-4"></div>
                    {/* Redirects to /inventory (Private) */}
                    <MenuItem 
                        icon={Ticket} 
                        label={t['prof.tab.coupons']} 
                        value={myCouponsCount}
                        onClick={() => navigate('/inventory')} 
                    />
                </div>
            </div>
            
            {/* 4. Settings & Admin */}
            <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                <MenuItem 
                    icon={Settings} 
                    label={t['prof.settings']} 
                    onClick={() => navigate('/settings')} 
                />
                {currentUser.websiteUrl && (
                    <>
                        <div className="h-px bg-white/5 mx-4"></div>
                        <MenuItem 
                            icon={LinkIcon} 
                            label={t['prof.website']} 
                            onClick={() => window.open(currentUser.websiteUrl, '_blank')} 
                        />
                    </>
                )}
            </div>
       </div>
    </div>
  );
};