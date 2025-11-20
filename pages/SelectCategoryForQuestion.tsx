import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, ChevronRight, Utensils, Home, Plane, Calendar, CreditCard, MessageSquare, FileText, Banknote, Coffee, MoreHorizontal, Cat, Scale, Heart, Wifi, Sparkles, Landmark, BookOpen, GraduationCap, School, Users, Star, ShoppingBag, HelpCircle, Briefcase, Baby, Dumbbell, Bus, Wrench, Smile, Languages } from 'lucide-react';
import { translations } from '../translations';

export const SelectCategoryForQuestion: React.FC = () => {
  const { categories, updateQuestionDraft, language } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  const handleSelect = (categoryId: string) => {
    updateQuestionDraft({ categoryId });
    navigate(-1);
  };

  const getCategoryIcon = (iconName: string) => {
      switch(iconName) {
          case 'visa': return <FileText size={20} />;
          case 'money': return <Banknote size={20} />;
          case 'leisure': return <Coffee size={20} />;
          case 'other': return <MoreHorizontal size={20} />;
          case 'food': return <Utensils size={20} />;
          case 'animals': return <Cat size={20} />;
          case 'housing': return <Home size={20} />;
          case 'law': return <Scale size={20} />;
          case 'health': return <Heart size={20} />;
          case 'internet': return <Wifi size={20} />;
          case 'beauty': return <Sparkles size={20} />;
          case 'culture': return <Landmark size={20} />;
          case 'courses': return <BookOpen size={20} />;
          case 'nostrification': return <GraduationCap size={20} />;
          case 'education': return <School size={20} />;
          case 'society': return <Users size={20} />;
          case 'reviews': return <Star size={20} />;
          case 'shopping': return <ShoppingBag size={20} />;
          case 'help': return <HelpCircle size={20} />;
          case 'travel': return <Plane size={20} />;
          case 'job': return <Briefcase size={20} />;
          case 'family': return <Baby size={20} />;
          case 'sport': return <Dumbbell size={20} />;
          case 'transport': return <Bus size={20} />;
          case 'services': return <Wrench size={20} />;
          case 'humor': return <Smile size={20} />;
          case 'language': return <Languages size={20} />;
          case 'events': return <Calendar size={20} />;
          default: return <MessageSquare size={20} />;
      }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      {/* Header */}
      <div className="shrink-0 p-4 flex items-center gap-3 border-b border-white/5 bg-bg">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-bold text-white">{t['ask.select_cat_title']}</h2>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        {categories.map((cat) => (
             <button
                key={cat.id}
                onClick={() => handleSelect(cat.id)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all bg-card mb-3 group"
            >
                <div className="w-12 h-12 rounded-full bg-input flex items-center justify-center text-white border border-white/5 group-active:bg-primary group-active:text-white group-active:border-primary transition-colors">
                    {getCategoryIcon(cat.icon)}
                </div>
                <div className="text-left flex-1">
                    <div className="font-bold text-white text-lg">{t[cat.name]}</div>
                </div>
                <ChevronRight className="text-secondary" size={20} />
            </button>
        ))}
      </div>
    </div>
  );
};