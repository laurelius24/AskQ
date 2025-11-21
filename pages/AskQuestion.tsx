

import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, QUESTION_COST } from '../store';
import { MapPin, ChevronRight, X, Zap, ArrowLeft, ImageIcon, Hash, EyeOff } from 'lucide-react';
import { translations } from '../translations';
import { PrimaryButton } from '../components/PrimaryButton';

export const AskQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { selectedLocation, availableLocations, language, categories, addQuestion, currentUser, questionDraft, updateQuestionDraft } = useStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from draft
  useEffect(() => {
      if (!questionDraft.locationId && selectedLocation) {
          updateQuestionDraft({ locationId: selectedLocation.id });
      }
      if (!questionDraft.categoryId) {
          updateQuestionDraft({ categoryId: categories[0].id });
      }
  }, [selectedLocation, questionDraft.locationId, questionDraft.categoryId, categories, updateQuestionDraft]);

  const activeLocation = availableLocations.find(l => l.id === questionDraft.locationId);
  const activeCategory = categories.find(c => c.id === questionDraft.categoryId);
  const canAfford = (currentUser?.walletBalance || 0) >= QUESTION_COST;

  const handleSubmit = () => {
    if (!questionDraft.title.trim() || !questionDraft.text.trim() || !activeLocation) return;
    
    const success = addQuestion({
        title: questionDraft.title,
        text: questionDraft.text,
        categoryId: questionDraft.categoryId, 
        locationId: activeLocation.id,
        isAnonymous: questionDraft.isAnonymous,
        attachments: questionDraft.attachments,
        backgroundStyle: 'white'
    });
    
    if (success) navigate('/');
    else alert(t['ask.low_balance']);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  updateQuestionDraft({ attachments: [...questionDraft.attachments, reader.result] });
              }
          };
          reader.readAsDataURL(file);
      }
  };

  // Helper for settings row
  const SettingsRow = ({ icon: Icon, label, value, onClick, isToggle = false, toggled = false }: any) => (
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 active:bg-white/5 transition-colors"
      >
          <div className="flex items-center gap-4">
              <div className="text-secondary">
                  <Icon size={22} strokeWidth={1.5} />
              </div>
              <span className="text-base font-medium text-white">{label}</span>
          </div>
          
          {isToggle ? (
              <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${toggled ? 'bg-primary' : 'bg-white/10'}`}>
                    <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                        toggled ? 'translate-x-6' : 'translate-x-1'
                    }`}></div>
              </div>
          ) : (
            <div className="flex items-center gap-2">
                <span className="text-base text-white/70">{value}</span>
                <ChevronRight size={20} className="text-white/30" />
            </div>
          )}
      </button>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg text-white page-transition font-sans overflow-hidden">
      
      {/* Header */}
      <div className="shrink-0 px-4 py-4 flex items-center justify-between bg-bg z-20 sticky top-0 border-b border-white/5">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
          >
              <ArrowLeft size={24} className="text-white" />
          </button>
          <span className="font-bold text-lg">{t['ask.title']}</span>
          <div className="w-10"></div> 
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-bg">
          <div className="p-4 pb-40 max-w-xl mx-auto space-y-4">
              
              {/* 1. Title Input (Styled Card) */}
              <div className="bg-card rounded-2xl border border-white/5 focus-within:border-primary/50 transition-colors overflow-hidden">
                  <input
                      type="text"
                      value={questionDraft.title}
                      onChange={(e) => updateQuestionDraft({ title: e.target.value })}
                      placeholder={t['ask.title_ph']}
                      autoFocus
                      className="w-full bg-transparent text-xl font-bold text-white placeholder:text-secondary/40 outline-none border-none p-5 leading-tight"
                  />
              </div>

              {/* 2. Description Input (Styled Card) */}
              <div className="bg-card rounded-2xl border border-white/5 focus-within:border-primary/50 transition-colors overflow-hidden">
                  <textarea
                      value={questionDraft.text}
                      onChange={(e) => updateQuestionDraft({ text: e.target.value })}
                      placeholder={t['ask.desc_ph']}
                      className="w-full min-h-[180px] bg-transparent text-base text-white placeholder:text-secondary/40 outline-none border-none p-5 resize-none leading-relaxed"
                  />
              </div>

              {/* 3. Attachments (Horizontal Scroll) */}
              <div>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="shrink-0 w-20 h-20 rounded-2xl bg-card border border-white/10 flex items-center justify-center text-secondary hover:text-primary hover:border-primary/30 transition-all active:scale-95"
                        >
                            <ImageIcon size={24} strokeWidth={1.5} />
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                        
                        {questionDraft.attachments.map((url, idx) => (
                            <div key={idx} className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-white/10 shadow-sm">
                                <img src={url} alt="attach" className="w-full h-full object-cover" />
                                <button 
                                    onClick={() => updateQuestionDraft({ attachments: questionDraft.attachments.filter((_, i) => i !== idx) })}
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 backdrop-blur-md"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}
                  </div>
              </div>

              {/* 4. Settings Block (Grouped) */}
              <div className="bg-card rounded-2xl overflow-hidden border border-white/5 mt-4">
                  <SettingsRow 
                    icon={Hash} 
                    label={t['ask.category_label']}
                    value={activeCategory ? t[activeCategory.name] : t['ask.tap_select']}
                    onClick={() => navigate('/ask/category')}
                  />
                  <div className="h-px bg-white/5 ml-14"></div>
                  <SettingsRow 
                    icon={MapPin} 
                    label={t['ask.location_label']}
                    value={activeLocation ? activeLocation.name : t['header.select_loc']}
                    onClick={() => navigate('/ask/location')}
                  />
                  <div className="h-px bg-white/5 ml-14"></div>
                  <SettingsRow 
                    icon={EyeOff} 
                    label={t['ask.anon_label']}
                    isToggle={true}
                    toggled={questionDraft.isAnonymous}
                    onClick={() => updateQuestionDraft({ isAnonymous: !questionDraft.isAnonymous })}
                  />
              </div>

          </div>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg border-t border-white/5 pb-safe z-30">
        <PrimaryButton 
            onClick={handleSubmit}
            disabled={!questionDraft.text.trim() || !questionDraft.title.trim() || !canAfford}
        >
            <span className="text-base">{t['ask.submit']}</span>
            <div className="w-px h-4 bg-white/20"></div>
            <div className="flex items-center gap-1 opacity-90">
                <span className="text-sm font-bold">{QUESTION_COST}</span>
                <Zap size={14} fill="currentColor" />
            </div>
        </PrimaryButton>
        {!canAfford && (
            <p className="text-center text-danger text-sm mt-3 font-medium">{t['ask.low_balance']}</p>
        )}
      </div>

    </div>
  );
};