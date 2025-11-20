import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { MessageCircle, Eye, MapPin, CheckCircle2, TrendingUp, Target, ChevronRight, Globe, Clock, Flame, ThumbsUp, FileText, Banknote, Coffee, MoreHorizontal, Utensils, Cat, Home, Scale, Heart, Wifi, Sparkles, Landmark, BookOpen, GraduationCap, School, Users, Star, ShoppingBag, HelpCircle, Plane, Briefcase, Baby, Dumbbell, Bus, Wrench, Smile, Languages, Calendar, CreditCard, MessageSquare } from 'lucide-react';
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

const getCategoryIcon = (iconName: string) => {
    switch(iconName) {
          case 'visa': return <FileText size={12} />;
          case 'money': return <Banknote size={12} />;
          case 'leisure': return <Coffee size={12} />;
          case 'other': return <MoreHorizontal size={12} />;
          case 'food': return <Utensils size={12} />;
          case 'animals': return <Cat size={12} />;
          case 'housing': return <Home size={12} />;
          case 'law': return <Scale size={12} />;
          case 'health': return <Heart size={12} />;
          case 'internet': return <Wifi size={12} />;
          case 'beauty': return <Sparkles size={12} />;
          case 'culture': return <Landmark size={12} />;
          case 'courses': return <BookOpen size={12} />;
          case 'nostrification': return <GraduationCap size={12} />;
          case 'education': return <School size={12} />;
          case 'society': return <Users size={12} />;
          case 'reviews': return <Star size={12} />;
          case 'shopping': return <ShoppingBag size={12} />;
          case 'help': return <HelpCircle size={12} />;
          case 'travel': return <Plane size={12} />;
          case 'job': return <Briefcase size={12} />;
          case 'family': return <Baby size={12} />;
          case 'sport': return <Dumbbell size={12} />;
          case 'transport': return <Bus size={12} />;
          case 'services': return <Wrench size={12} />;
          case 'humor': return <Smile size={12} />;
          case 'language': return <Languages size={12} />;
          case 'events': return <Calendar size={12} />;
          default: return <MessageSquare size={12} />;
    }
};

export const Feed: React.FC = () => {
  const { selectedLocation, language, questions, categories, availableLocations } = useStore();
  const navigate = useNavigate();
  const t = translations[language];
  
  // Filter State
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'new' | 'popular'>('new');

  useEffect(() => {
    if (!selectedLocation) navigate('/location');
  }, [selectedLocation, navigate]);

  if (!selectedLocation) return null;

  // Filter Logic
  const locationQuestions = questions.filter(q => {
      // 1. Get the full location object for this specific question
      const questionLocation = availableLocations.find(l => l.id === q.locationId);
      
      if (!questionLocation) return false;

      // 2. Check for Direct Match (e.g. Question is in "Prague" and we selected "Prague")
      const isDirectMatch = q.locationId === selectedLocation.id;

      // 3. Check for Child Match (e.g. Question is in "Prague", we selected "Czechia", and Prague's parent is Czechia)
      // This is only valid if the User selected a COUNTRY.
      const isChildMatch = selectedLocation.type === LocationType.COUNTRY && 
                           questionLocation.parentId === selectedLocation.id;

      const matchesLocation = isDirectMatch || isChildMatch;
      
      // Category Check
      const matchesCategory = activeCategoryId === 'all' || q.categoryId === activeCategoryId;
      
      return matchesLocation && matchesCategory;
  });

  // Sort Logic
  const sortedQuestions = [...locationQuestions].sort((a, b) => {
      if (sortBy === 'popular') {
          // Primary: Views, Secondary: Likes
          return (b.views + (b.likes * 5)) - (a.views + (a.likes * 5));
      }
      // Default: Newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="pb-24 min-h-screen bg-bg page-transition font-sans">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-bg/95 backdrop-blur-xl px-4 py-4 flex items-center justify-between border-b border-white/5">
        {/* Left: App Logo */}
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
                <Globe size={20} className="text-white" strokeWidth={2} />
            </div>
            <span className="font-bold text-xl text-white tracking-tight">AskQ</span>
        </div>
        
        {/* Right: Location Selector */}
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
        
        {/* Tasks Minimalist Banner */}
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

        {/* Controls: Sort & Filters */}
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

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => setActiveCategoryId('all')}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        activeCategoryId === 'all'
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-card text-secondary border-transparent active:bg-white/10'
                    }`}
                >
                    {t['feed.tags.all']}
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategoryId(cat.id)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                            activeCategoryId === cat.id 
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
                        {/* Card Header: Category & Date */}
                        <div className="flex justify-between items-start mb-3">
                             <div className="flex gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-lg flex items-center gap-1">
                                    {/* Find Category Icon */}
                                    {getCategoryIcon(categories.find(c => c.id === q.categoryId)?.icon || '')}
                                    {/* Find Category Name */}
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
                            {/* Bottom Left: Location */}
                            <div className="flex items-center">
                                {selectedLocation.type === LocationType.COUNTRY && q.locationId !== selectedLocation.id && (
                                    <span className="text-[10px] font-bold text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                        <MapPin size={12} className="text-primary" />
                                        {availableLocations.find(l => l.id === q.locationId)?.name}
                                    </span>
                                )}
                            </div>

                            {/* Bottom Right: Likes & Comments */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <ThumbsUp size={16} className="text-secondary" strokeWidth={2} />
                                    <span className="font-bold text-white">{q.likes}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MessageCircle size={16} className="text-secondary" strokeWidth={2} />
                                    <span className="font-bold text-white">5</span>
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