

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Zap, Sparkles, MessageCircle, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { Coupon } from '../types';
import { PageHeader } from '../components/PageHeader';
import { CouponModal } from '../components/CouponModal';

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, availableCoupons, buyCoupon, language } = useStore();
  const t = translations[language];
  
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const handleBuy = (id: string) => {
    const success = buyCoupon(id);
    if (success) {
      navigate('/inventory');
    } else {
      alert(t['shop.fail']);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="pb-24 min-h-screen bg-bg page-transition">
      {/* Header */}
      <PageHeader 
        title={t['shop.title']}
        hideBack
        className="bg-bg/95 backdrop-blur-xl"
        rightElement={
          <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Zap size={10} className="text-white fill-white" />
            </div>
            <span className="font-bold text-primary">{currentUser.walletBalance}</span>
          </div>
        }
      />

      <div className="p-4">
        {/* Minimalist Coming Soon Banner */}
        <div className="w-full bg-card border border-white/5 rounded-3xl p-5 flex items-center gap-4 mb-6 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/5">
                <Sparkles size={24} strokeWidth={1.5} className="text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-white text-base leading-tight">{t['shop.soon_title']}</h3>
                <p className="text-xs text-secondary mt-1">{t['shop.soon_desc']}</p>
            </div>
        </div>

        <h3 className="font-bold text-white mb-4">{t['shop.avail_coupons']}</h3>
        
        <div className="space-y-4">
            {availableCoupons.map(coupon => {
                const isPurchased = currentUser.inventory.includes(coupon.id);
                
                return (
                    <div 
                        key={coupon.id} 
                        onClick={() => setSelectedCoupon(coupon)}
                        className="bg-card rounded-2xl border border-white/5 p-3 flex gap-4 items-center shadow-sm active:scale-[0.99] transition-all cursor-pointer hover:border-white/10"
                    >
                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative bg-input">
                            <img src={coupon.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                            {isPurchased && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <CheckCircle2 className="text-success" size={24} />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">{coupon.partnerName}</div>
                            <h4 className="font-bold text-white text-base leading-tight mb-1 truncate">{coupon.title}</h4>
                            <p className="text-xs text-secondary truncate">{coupon.description}</p>
                        </div>

                        {/* Price Badge */}
                        <div className="flex flex-col items-end gap-1 pl-2 border-l border-white/5">
                             {isPurchased ? (
                                 <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-lg whitespace-nowrap">
                                     {t['shop.owned']}
                                 </span>
                             ) : (
                                <div className="flex items-center gap-1 text-white font-bold">
                                    <span>{coupon.cost}</span>
                                    <Zap size={14} className="text-primary fill-primary" />
                                </div>
                             )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Contact Us Footer */}
        <div className="border-t border-white/5 pt-6 mt-8 text-center">
              <p className="text-secondary text-sm mb-3">{t['wallet.contact_us']}</p>
              <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-bold flex items-center gap-2 mx-auto hover:bg-white/10 transition-colors">
                  <MessageCircle size={16} />
                  {t['wallet.contact_btn']}
              </button>
          </div>
      </div>

      {/* Reusable Coupon Modal */}
      {selectedCoupon && (
          <CouponModal 
            coupon={selectedCoupon} 
            onClose={() => setSelectedCoupon(null)} 
            isPurchased={currentUser.inventory.includes(selectedCoupon.id)}
            actionLabel={t['shop.buy']}
            onAction={() => handleBuy(selectedCoupon.id)}
            actionDisabled={currentUser.walletBalance < selectedCoupon.cost}
            priceDisplay={
                <div className="flex items-center gap-1 text-xl font-bold text-white">
                    {selectedCoupon.cost} 
                    <Zap size={18} className="text-primary fill-primary" />
                </div>
            }
          />
      )}

    </div>
  );
};