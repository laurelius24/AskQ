import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Copy, Clock, CheckCircle2, Ticket, ChevronRight, ChevronLeft } from 'lucide-react';
import { translations } from '../translations';
import { Coupon } from '../types';

export const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, availableCoupons, language } = useStore();
  const t = translations[language];
  
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  if (!currentUser) return null;

  // Filter only owned coupons
  const myCoupons = availableCoupons.filter(c => currentUser.inventory.includes(c.id));

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
  };

  const copyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      alert(t['prof.copy']);
  };

  const CouponModal = ({ coupon, onClose }: { coupon: Coupon, onClose: () => void }) => {
      const [isRevealed, setIsRevealed] = useState(false);
      const [isExpanded, setIsExpanded] = useState(false);
      const MAX_CHARS = 100;
      const isLongText = coupon.description.length > MAX_CHARS;

      return (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
              <div 
                className="bg-[#1C1C1E] w-full h-[90vh] rounded-t-3xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 shadow-2xl border-t border-white/10" 
                onClick={e => e.stopPropagation()}
              >
                  {/* Header */}
                  <div className="shrink-0 flex items-center justify-center relative p-4 border-b border-white/5">
                      <h3 className="font-bold text-white text-lg">{coupon.partnerName}</h3>
                      <button onClick={onClose} className="absolute left-4 p-2 -ml-2 text-primary flex items-center gap-1 active:opacity-70">
                          <ChevronLeft size={28} /> 
                      </button>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-5 pb-10 no-scrollbar">
                      
                      {/* Image Card */}
                      <div className="bg-white rounded-2xl p-8 relative mb-6 shadow-sm border border-white/10">
                          <div className="aspect-[16/9] w-full flex items-center justify-center">
                               <img src={coupon.imageUrl} alt={coupon.title} className="max-w-full max-h-full object-contain drop-shadow-xl" />
                          </div>
                          {/* Partner Tag Overlay */}
                           <div className="absolute top-4 right-4 bg-[#1C1C1E] px-3 py-1 rounded-md flex items-center gap-1 shadow-md">
                              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{coupon.partnerName}</span>
                          </div>
                      </div>

                      {/* Title & Expiry */}
                      <div className="mb-6">
                          <h2 className="font-bold text-white text-2xl mb-2 leading-tight">{coupon.title}</h2>
                          <div className="flex items-center gap-2 text-secondary text-sm bg-white/5 w-fit px-3 py-1.5 rounded-lg">
                               <Clock size={14} />
                               <span>{t['shop.expires']} {formatDate(coupon.expiresAt)}</span>
                          </div>
                      </div>

                      {/* Terms */}
                      <div className="bg-[#2C2C2E] rounded-2xl p-5 mb-6 border border-white/5">
                          <h4 className="font-bold text-white mb-2 text-sm uppercase tracking-wider opacity-70">{t['shop.terms']}</h4>
                          <p className={`text-gray-300 text-sm leading-relaxed ${!isExpanded && isLongText ? 'line-clamp-3' : ''}`}>
                              {coupon.description}
                          </p>
                          {isLongText && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-3 text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                            >
                                {isExpanded ? t['shop.show_less'] : t['shop.read_more']} <ChevronRight size={12} className={`transition-transform ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
                            </button>
                          )}
                      </div>

                      {/* Spacer */}
                      <div className="h-20"></div>
                  </div>

                   {/* Sticky Action Area */}
                   <div className="p-5 bg-[#1C1C1E] border-t border-white/5 pb-safe">
                      {!isRevealed ? (
                            <button 
                              onClick={() => setIsRevealed(true)}
                              className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl text-base shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
                          >
                              {t['shop.use_coupon']}
                          </button>
                      ) : (
                          <div className="bg-[#2C2C2E] rounded-2xl p-5 border border-dashed border-primary/50 text-center animate-in fade-in zoom-in">
                              <div className="text-xs text-secondary uppercase mb-2 font-bold tracking-wider">{t['shop.code']}</div>
                              <div className="text-3xl font-mono font-bold text-white tracking-widest mb-4 select-all">{coupon.promoCode}</div>
                              <button onClick={() => copyCode(coupon.promoCode)} className="text-primary font-bold text-sm flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 rounded-full mx-auto hover:bg-primary/20 transition-colors">
                                  <Copy size={16} /> {t['share.copy']}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-white/5 flex items-center gap-3 bg-bg sticky top-0 z-10">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2 hover:bg-white/10 rounded-full active:bg-white/20 transition-colors">
            <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold">{t['inv.title']}</h1>
      </div>

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
          <CouponModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />
      )}
    </div>
  );
};