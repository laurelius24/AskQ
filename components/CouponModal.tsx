

import React, { useState } from 'react';
import { ChevronLeft, Clock, ChevronRight, Copy, MapPin, Globe } from 'lucide-react';
import { Coupon } from '../types';
import { translations } from '../translations';
import { useStore } from '../store';

interface CouponModalProps {
  coupon: Coupon;
  onClose: () => void;
  isPurchased: boolean;
  onAction: () => void; // Buy or Use
  actionLabel: string; // "Buy" or "Use Coupon"
  actionDisabled?: boolean;
  priceDisplay?: React.ReactNode; // For displaying price if not purchased
}

export const CouponModal: React.FC<CouponModalProps> = ({ 
  coupon, 
  onClose, 
  isPurchased,
  onAction,
  actionLabel,
  actionDisabled = false,
  priceDisplay
}) => {
  const { language, availableLocations } = useStore();
  const t = translations[language];
  const [isRevealed, setIsRevealed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const MAX_CHARS = 100;
  const isLongText = coupon.description.length > MAX_CHARS;

  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
  };

  const copyCode = (code: string) => {
      navigator.clipboard.writeText(code);
      alert(t['prof.copy']);
  };

  const getLocationName = (locId?: string) => {
      if (!locId) return t['search.scope_global'];
      const loc = availableLocations.find(l => l.id === locId);
      return loc ? loc.name : 'Unknown';
  };

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
                      <h2 className="font-bold text-white text-2xl mb-3 leading-tight">{coupon.title}</h2>
                      
                      <div className="flex flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-secondary text-sm bg-white/5 w-fit px-3 py-1.5 rounded-lg">
                               <Clock size={14} />
                               <span>{t['shop.expires']} {formatDate(coupon.expiresAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-secondary text-sm bg-white/5 w-fit px-3 py-1.5 rounded-lg">
                               {coupon.locationId ? <MapPin size={14} /> : <Globe size={14} />}
                               <span>{t['shop.valid_in']}: {getLocationName(coupon.locationId)}</span>
                          </div>
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
                          {priceDisplay && (
                            <div className="flex flex-col pl-2">
                                <span className="text-xs text-secondary font-bold uppercase tracking-wider">Price</span>
                                {priceDisplay}
                            </div>
                          )}
                          <button 
                              onClick={onAction}
                              disabled={actionDisabled}
                              className={`flex-1 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] shadow-glow flex items-center justify-center gap-2 ${
                                  !actionDisabled
                                  ? 'bg-primary text-white hover:bg-primary/90' 
                                  : 'bg-white/10 text-secondary cursor-not-allowed shadow-none'
                              }`}
                          >
                              {actionLabel}
                          </button>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};