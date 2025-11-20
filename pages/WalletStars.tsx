import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Star, Copy, LogOut, ArrowDownLeft, ArrowUpRight, Loader2, X } from 'lucide-react';
import { translations } from '../translations';

export const WalletStars: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, connectWallet, disconnectWallet, language } = useStore();
  const t = translations[language];

  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleBack = () => {
    navigate('/profile');
  };

  const simulateConnection = (walletName: string) => {
      setIsConnecting(true);
      setTimeout(() => {
          const mockAddress = `EQcB${Math.random().toString(36).substring(2, 12)}...${Math.random().toString(36).substring(2, 6)}`;
          connectWallet(mockAddress);
          setIsConnecting(false);
          setIsConnectModalOpen(false);
      }, 2000);
  };

  const copyAddress = () => {
      if (currentUser?.walletAddress) {
          navigator.clipboard.writeText(currentUser.walletAddress);
          alert(t['prof.copy']);
      }
  };

  if (!currentUser) return null;

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-white/5 flex items-center gap-3 bg-bg sticky top-0 z-10">
        <button onClick={handleBack} className="p-2 -ml-2 hover:bg-white/10 rounded-full active:bg-white/20 transition-colors">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{t['wallet.stars.title']}</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
          {/* Balance Card */}
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-sm mb-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-warning to-orange-500"></div>
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-warning">
                  <Star size={32} fill="currentColor" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{currentUser.starsBalance}</div>
              <div className="text-sm text-secondary font-medium mb-6">Stars Balance</div>

              {currentUser.walletAddress ? (
                   <div className="bg-input rounded-xl p-3 flex items-center justify-between gap-2">
                       <div className="text-xs text-secondary truncate font-mono">{currentUser.walletAddress}</div>
                       <div className="flex gap-1">
                           <button onClick={copyAddress} className="p-1.5 bg-white/5 rounded text-white hover:bg-white/10">
                               <Copy size={14} />
                           </button>
                           <button onClick={disconnectWallet} className="p-1.5 bg-white/5 rounded text-danger hover:bg-danger/10">
                               <LogOut size={14} />
                           </button>
                       </div>
                   </div>
              ) : (
                  <button 
                      onClick={() => setIsConnectModalOpen(true)}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-colors"
                  >
                      {t['prof.connect']}
                  </button>
              )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                onClick={() => alert("Feature coming soon!")}
                className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                  <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                      <ArrowDownLeft size={20} />
                  </div>
                  <span className="text-xs font-bold">{t['wallet.receive']}</span>
              </button>
              <button 
                onClick={() => alert("Feature coming soon!")}
                className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                  <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger">
                      <ArrowUpRight size={20} />
                  </div>
                  <span className="text-xs font-bold">{t['wallet.send']}</span>
              </button>
          </div>

          {/* History */}
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{t['wallet.history']}</h3>
          <div className="space-y-2">
              {/* Mock Transactions */}
              <div className="bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                          <Star size={16} className="text-warning" />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-white">{t['wallet.trans.topup']}</div>
                          <div className="text-xs text-secondary">Yesterday</div>
                      </div>
                  </div>
                  <div className="text-success font-bold text-sm">+50</div>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                          <ArrowUpRight size={16} />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-white">{t['wallet.trans.tip']}</div>
                          <div className="text-xs text-secondary">2 days ago</div>
                      </div>
                  </div>
                  <div className="text-white font-bold text-sm">-10</div>
              </div>
          </div>
      </div>

       {/* Connect Wallet Modal */}
       {isConnectModalOpen && (
           <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
               <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl relative">
                   <button 
                        onClick={() => !isConnecting && setIsConnectModalOpen(false)}
                        className="absolute top-4 right-4 text-secondary active:text-white"
                   >
                       <X size={20} />
                   </button>
                   
                   <h3 className="text-xl font-bold text-white mb-6 text-center">{t['prof.select_wallet']}</h3>

                   {isConnecting ? (
                       <div className="py-10 flex flex-col items-center justify-center gap-4">
                           <Loader2 size={40} className="text-primary animate-spin" />
                           <span className="text-secondary text-sm font-medium">Requesting connection...</span>
                       </div>
                   ) : (
                       <div className="space-y-3">
                           <button 
                                onClick={() => simulateConnection('Tonkeeper')}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-[0.98] transition-all"
                           >
                               <div className="w-10 h-10 rounded-xl bg-[#45AEF5] flex items-center justify-center text-white font-bold text-lg">T</div>
                               <span className="font-bold text-white">Tonkeeper</span>
                           </button>
                           <button 
                                onClick={() => simulateConnection('Wallet')}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 active:scale-[0.98] transition-all"
                           >
                               <div className="w-10 h-10 rounded-xl bg-[#0088CC] flex items-center justify-center text-white font-bold text-lg">W</div>
                               <span className="font-bold text-white">Telegram Wallet</span>
                           </button>
                       </div>
                   )}
               </div>
           </div>
       )}
    </div>
  );
};