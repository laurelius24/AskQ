import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Zap, Sparkles, MessageCircle, Clock, Copy, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { translations } from '../translations';
import { Coupon } from '../types';

export const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, availableCoupons, buyCoupon, language } = useStore();
  const t = translations[language];
  
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const handleBuy = (id: string) => {
    // Removed window.confirm for faster flow
    const success = buyCoupon(id);
    if (success) {
      // Redirect immediately to inventory to show the purchased item
      navigate('/inventory');
    } else {
      alert(t['shop.fail']);
    }
  };

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
  };

  const copyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      alert(t['prof.copy']);
  };

  if (!currentUser) return null;

  const CouponModal = ({ coupon, onClose }: { coupon: Coupon, onClose: () => void }) => {
      const isPurchased = currentUser.inventory.includes(coupon.id);
      const canAfford = currentUser.walletBalance >= coupon.cost;
      const [isRevealed, setIsRevealed] = useState(false);
      
      // Logic for Read More
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

                      {/* Terms / Description */}
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
                      {isPurchased ? (
                          !isRevealed ? (
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
                          )
                      ) : (
                          <div className="flex items-center gap-4">
                              <div className="flex flex-col pl-2">
                                  <span className="text-xs text-secondary font-bold uppercase tracking-wider">Price</span>
                                  <div className="flex items-center gap-1 text-xl font-bold text-white">
                                      {coupon.cost} 
                                      <Zap size={18} className="text-primary fill-primary" />
                                  </div>
                              </div>
                              <button 
                                  onClick={() => handleBuy(coupon.id)}
                                  disabled={!canAfford}
                                  className={`flex-1 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-glow flex items-center justify-center gap-2 ${
                                      canAfford 
                                      ? 'bg-primary text-white hover:bg-primary/90' 
                                      : 'bg-white/10 text-secondary cursor-not-allowed shadow-none'
                                  }`}
                              >
                                  {t['shop.buy']}
                              </button>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="pb-24 min-h-screen bg-bg page-transition">
      {/* Header */}
      <div className="bg-bg/95 backdrop-blur-xl p-4 sticky top-0 z-10 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{t['shop.title']}</h1>
        </div>
        <div className="bg-primary/10 px-3 py-1.5 rounded-full flex items-center gap-2 border border-primary/20">
            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                <Zap size={10} className="text-white fill-white" />
            </div>
            <span className="font-bold text-primary">{currentUser.walletBalance}</span>
        </div>
      </div>

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
                        {/* Small Thumbnail */}
                        <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden relative bg-input">
                            <img src={coupon.imageUrl} alt="thumb" className="w-full h-full object-cover" />
                            {isPurchased && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <CheckCircle2 className="text-success" size={24} />
                                </div>
                            )}
                        </div>
                        
                        {/* Info */}
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

      {/* Detailed Modal */}
      {selectedCoupon && (
          <CouponModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} />
      )}

    </div>
  );
};