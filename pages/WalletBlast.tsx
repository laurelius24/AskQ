

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Zap, Target, ShoppingBag, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';

export const WalletBlast: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, language } = useStore();
  const t = translations[language];

  if (!currentUser) return null;

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['wallet.blast.title']} onBack={() => navigate('/profile')} />

      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
          {/* Balance Card */}
          <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-sm mb-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                  <Zap size={32} className="text-white fill-white" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{currentUser.walletBalance}</div>
              <div className="text-sm text-secondary font-medium mb-4">BLAST Balance</div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3 mb-8">
              <button 
                onClick={() => navigate('/tasks')}
                className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                      <Target size={20} />
                  </div>
                  <span className="text-xs font-bold">{t['wallet.earn']}</span>
              </button>
              <button 
                onClick={() => navigate('/shop')}
                className="bg-card border border-white/5 p-4 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/5 active:scale-[0.98] transition-all"
              >
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                      <ShoppingBag size={20} />
                  </div>
                  <span className="text-xs font-bold">{t['wallet.spend']}</span>
              </button>
          </div>

          {/* History */}
          <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{t['wallet.history']}</h3>
          <div className="space-y-2">
              {/* Mock Transactions */}
              <div className="bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                          <CheckCircle2 size={16} />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-white">{t['wallet.trans.reward']}</div>
                          <div className="text-xs text-secondary">Today</div>
                      </div>
                  </div>
                  <div className="text-success font-bold text-sm">+2000</div>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                          <ShoppingBag size={16} />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-white">{t['wallet.trans.purchase']}</div>
                          <div className="text-xs text-secondary">Yesterday</div>
                      </div>
                  </div>
                  <div className="text-white font-bold text-sm">-100</div>
              </div>
              <div className="bg-card p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                          <ArrowUpRight size={16} />
                      </div>
                      <div>
                          <div className="text-sm font-bold text-white">{t['wallet.trans.tip']}</div>
                          <div className="text-xs text-secondary">3 days ago</div>
                      </div>
                  </div>
                  <div className="text-white font-bold text-sm">-50</div>
              </div>
          </div>
      </div>
    </div>
  );
};