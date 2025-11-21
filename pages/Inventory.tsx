

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Ticket, CheckCircle2 } from 'lucide-react';
import { translations } from '../translations';
import { Coupon } from '../types';
import { PageHeader } from '../components/PageHeader';
import { CouponModal } from '../components/CouponModal';

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, availableCoupons, language } = useStore();
  const t = translations[language];
  
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  if (!currentUser) return null;

  // Filter only owned coupons
  const myCoupons = availableCoupons.filter(c => currentUser.inventory.includes(c.id));

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['inv.title']} onBack={() => navigate('/profile')} />

      <div className="flex-1 overflow-y-auto p-4 pb-24 no-scrollbar">
        {myCoupons.length === 0 ? (
            <div className="text-center py-20 opacity-50 flex flex-col items-center gap-4">
                <Ticket size={48} className="text-secondary" strokeWidth={1} />
                <p className="font-medium text-secondary">{t['inv.empty']}</p>
                <button onClick={() => navigate('/shop')} className="text-primary font-bold text-sm">
                    {t['shop.title']}
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {myCoupons.map(coupon => (
                    <div 
                        key={coupon.id} 
                        onClick={() => setSelectedCoupon(coupon)}
                        className="bg-card rounded-2xl border border-white/5 p-3 flex gap-4 items-center shadow-sm active:scale-[0.99] transition-all cursor-pointer hover:border-white/10"
                    >
                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative bg-input">
                            <img src={coupon.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <CheckCircle2 className="text-success drop-shadow-md" size={24} />
                            </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">{coupon.partnerName}</div>
                            <h4 className="font-bold text-white text-base leading-tight mb-1 truncate">{coupon.title}</h4>
                            <div className="text-xs text-secondary font-mono bg-white/5 inline-block px-2 py-0.5 rounded">
                                {coupon.promoCode}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {selectedCoupon && (
          <CouponModal 
            coupon={selectedCoupon} 
            onClose={() => setSelectedCoupon(null)} 
            isPurchased={true}
            actionLabel={t['shop.use_coupon']}
            onAction={() => {}} // Logic handled inside modal for purchased items
          />
      )}
    </div>
  );
};