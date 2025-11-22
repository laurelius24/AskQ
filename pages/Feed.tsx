
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { MessageCircle, MapPin, CheckCircle2, TrendingUp, Target, ChevronRight, Globe, Clock, Flame, ThumbsUp, Loader2, FileText, Banknote, Coffee, MoreHorizontal, Utensils, Cat, Home, Scale, Heart, Wifi, Sparkles, Landmark, BookOpen, GraduationCap, School, Users, Star, ShoppingBag, Plane, Briefcase, Baby, Dumbbell, Bus, Wrench, Smile, Languages, Calendar, Car, HeartHandshake, MessageSquare } from 'lucide-react';
import { translations } from '../translations';
import { LocationType } from '../types';

const formatText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            try {
                const url = new URL(part);
                return <span key={i} className="text-primary font-medium">{url.hostname}</span>;
            } catch (e) { return part; }
        }
        return part;
    });
};

const getCategoryIcon = (iconName: string, size = 12) => {
    switch(iconName) {
          case 'visa': return <FileText size={size} />;
          case 'money': return <Banknote size={size} />;
          case 'leisure': return <Coffee size={size} />;
          case 'other': return <MoreHorizontal size={size} />;
          case 'food': return <Utensils size={size} />;
          case 'animals': return <Cat size={size} />;
          case 'housing': return <Home size={size} />;
          case 'law': return <Scale size={size} />;
          case 'health': return <Heart size={size} />;
          case 'internet': return <Wifi size={size} />;
          case 'beauty': return <Sparkles size={size} />;
          case 'culture': return <Landmark size={size} />;
          case 'courses': return <BookOpen size={size} />;
          case 'nostrification': return <GraduationCap size={size} />;
          case 'education': return <School size={size} />;
          case 'society': return <Users size={size} />;
          case 'reviews': return <Star size={size} />;
          case 'shopping': return <ShoppingBag size={size} />;
          case 'travel': return <Plane size={size} />;
          case 'job': return <Briefcase size={size} />;
          case 'family': return <Baby size={size} />;
          case 'sport': return <Dumbbell size={size} />;
          case 'transport': return <Bus size={size} />;
          case 'services': return <Wrench size={size} />;
          case 'humor': return <Smile size={size} />;
          case 'language': return <Languages size={size} />;
          case 'events': return <Calendar size={size} />;
          case 'auto': return <Car size={size} />;
          case 'dating': return <HeartHandshake size={size} />;
          default: return <MessageSquare size={size} />;
    }
};

export const Feed: React.FC = () => {
  const { selectedLocation, language, questions, categories, availableLocations } = useStore();
  const navigate = useNavigate();
  const t = translations[language];
  
  // Filter State
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');

  useEffect(() => {
    if (!selectedLocation) {
        // Small timeout to allow state to settle before redirecting
        const timer = setTimeout(() => navigate('/location'), 500);
        return () => clearTimeout(timer);
    }
  }, [selectedLocation, navigate]);

  // FIX: Render loader instead of null (black screen) while location loads
  if (!selectedLocation) {
      return (
          <div className="min-h-screen bg-bg flex items-center justify-center text-white">
              <Loader2 className="animate-spin text-primary" size={32} />
          </div>
      );
  }

  // Filter Logic
  const locationQuestions = questions.filter(q => {
      // 1. Get the full location object for this specific question
      const questionLocation = availableLocations.find(l => l.id === q.locationId);
      
      // If location not loaded yet, include it cautiously or exclude. 
      // Excluding for safety to prevent crashes, but if it's the selected location it usually exists.
      if (!questionLocation) {
          // Edge case: if q.locationId matches selectedLocation.id directly, allow it even if not in availableLocations list yet
          if (q.locationId === selectedLocation.id) return true;
          return false;
      }

      // 2. Check for Direct Match
      const isDirectMatch = q.locationId === selectedLocation.id;

      // 3. Check for Child Match
      const isChildMatch = selectedLocation.type === LocationType.COUNTRY && 
                           questionLocation.parentId === selectedLocation.id;

      const matchesLocation = isDirectMatch || isChildMatch;
      
      // Category Check
      let matchesCategory = true;
      if (activeSubCategoryId !== 'all') {
          matchesCategory = q.categoryId === activeSubCategoryId;
      }
      
      return matchesLocation && matchesCategory;
  });

  // Sort Logic
  const sortedQuestions = [...locationQuestions].sort((a, b) => {
      if (sortBy === 'popular') {
          return (b.views + ((b.likes || 0) * 5)) - (a.views + ((a.likes || 0) * 5));
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="pb-24 min-h-screen bg-bg page-transition font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Globe size={20} className="text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">AskQ</span>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate('/location')}
                className="pl-4 pr-1.5 py-1.5 bg-card rounded-full border border-white/5 flex items-center gap-3 shadow-sm active:scale-95 transition-transform"
            >
                <span className="text-xs font-bold text-white truncate max-w-[120px]">{selectedLocation.name}</span>
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-inner">
                    <MapPin size={16} className="text-white" strokeWidth={2} />
                </div>
            </button>
        </div>
      </header>

      <div className="p-4 space-y-6">
        
        {/* Tasks Banner */}
        <div 
            onClick={() => navigate('/tasks')}
            className="w-full bg-card rounded-3xl p-4 border border-white/5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all cursor-pointer group"
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-input flex items-center justify-center text-white shadow-inner">
                    <Target size={24} strokeWidth={1.5} />
                </div>
                <div>
                    <h3 className="font-bold text-white text-base leading-tight">{t['feed.tasks.banner_title']}</h3>
                    <p className="text-xs text-secondary mt-1 font-medium">{t['feed.tasks.banner_desc']}</p>
                </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:bg-primary group-active:text-white transition-colors">
                <ChevronRight size={20} className="text-secondary group-active:text-white" />
            </div>
        </div>

        <div className="space-y-4">
            
            {/* Sort Toggles */}
            <div className="flex bg-card p-1 rounded-xl border border-white/5">
                <button 
                    onClick={() => setSortBy('new')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                        sortBy === 'new' 
                        ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                        : 'text-secondary'
                    }`}
                >
                    <Clock size={14} />
                    {t['feed.sort.new']}
                </button>
                <button 
                    onClick={() => setSortBy('popular')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                        sortBy === 'popular' 
                        ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                        : 'text-secondary'
                    }`}
                >
                    <Flame size={14} />
                    {t['feed.sort.popular']}
                </button>
            </div>

            {/* Category Filter (Flat List) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => setActiveSubCategoryId('all')}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeSubCategoryId === 'all'
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-card text-secondary border-transparent active:bg-white/10'
                    }`}
                >
                    {t['feed.tags.all']}
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveSubCategoryId(cat.id)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                            activeSubCategoryId === cat.id 
                            ? 'bg-primary text-white border-primary shadow-md' 
                            : 'bg-card text-secondary border-transparent active:bg-white/10'
                        }`}
                    >
                        {getCategoryIcon(cat.icon)} {t[cat.name]}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-4 min-h-[300px]">
                {sortedQuestions.length === 0 ? (
                    <div className="text-center py-20 opacity-50 flex flex-col items-center gap-4">
                        <TrendingUp size={48} className="text-secondary" strokeWidth={1} />
                        <p className="font-medium">{t['feed.empty']}</p>
                    </div>
                ) : (
                sortedQuestions.map((q) => (
                    <div
                        key={q.id}
                        onClick={() => navigate(`/question/${q.id}`)}
                        className="bg-card p-5 rounded-[24px] border border-white/5 active:scale-[0.98] transition-all shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                    {getCategoryIcon(categories.find(c => c.id === q.categoryId)?.icon || '')}
                                    {t[categories.find(c => c.id === q.categoryId)?.name || '']}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-bold text-secondary/70">
                                    {new Date(q.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-lg text-white mb-2 leading-tight tracking-tight">
                            {q.title}
                        </h3>
                        
                        <div className="text-sm text-secondary mb-4 line-clamp-2 leading-relaxed font-normal">
                            {formatText(q.text)}
                        </div>

                        {q.bestAnswerSnippet && (
                            <div className="mb-4 p-3 bg-input rounded-2xl border border-white/5 flex gap-3 items-start">
                                 <div className="mt-0.5 text-success shrink-0">
                                    <CheckCircle2 size={16} />
                                 </div>
                                 <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
                                    <span className="font-bold text-success mr-1">{t['q.best_answer']}:</span>
                                    {q.bestAnswerSnippet}
                                 </p>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-secondary text-xs border-t border-white/5 pt-3 mt-2">
                            <div className="flex items-center">
                                {selectedLocation.type === LocationType.COUNTRY && q.locationId !== selectedLocation.id && (
                                    <span className="text-[10px] font-bold text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                        <MapPin size={12} className="text-primary" />
                                        {availableLocations.find(l => l.id === q.locationId)?.name}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <ThumbsUp size={16} className="text-secondary" strokeWidth={2} />
                                    <span className="font-bold text-white">{q.likes || 0}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MessageCircle size={16} className="text-secondary" strokeWidth={2} />
                                    <span className="font-bold text-white">{q.answerCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
