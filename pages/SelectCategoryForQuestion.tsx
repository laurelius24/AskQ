






import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, CATEGORY_GROUPS } from '../store';
import { Utensils, Home, Plane, Calendar, CreditCard, MessageSquare, FileText, Banknote, Coffee, MoreHorizontal, Cat, Scale, Heart, Wifi, Sparkles, Landmark, BookOpen, GraduationCap, School, Users, Star, ShoppingBag, HelpCircle, Briefcase, Baby, Dumbbell, Bus, Wrench, Smile, Languages, Car, Tag, HeartHandshake } from 'lucide-react';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';

export const SelectCategoryForQuestion: React.FC = () => {
  const { categories, updateQuestionDraft, language } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  const handleSelect = (categoryId: string) => {
    updateQuestionDraft({ categoryId });
    navigate(-1);
  };

  const getCategoryIcon = (iconName: string, size = 20) => {
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

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['ask.select_cat_title']} />

      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
          {CATEGORY_GROUPS.map((group) => (
              <div key={group.id} className="mb-6">
                  {/* Group Header */}
                  <div className="flex items-center gap-2 mb-3 mt-2 px-1">
                      <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">{t[group.name]}</h3>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="grid grid-cols-2 gap-3">
                      {group.childrenIds.map(catId => {
                          const cat = categories.find(c => c.id === catId);
                          if (!cat) return null;
                          return (
                            <button
                                key={cat.id}
                                onClick={() => handleSelect(cat.id)}
                                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-card border border-white/5 active:scale-[0.98] active:border-primary active:bg-primary/10 transition-all"
                            >
                                <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-white">
                                    {getCategoryIcon(cat.icon, 20)}
                                </div>
                                <span className="text-xs font-bold text-center text-white leading-tight">
                                    {t[cat.name]}
                                </span>
                            </button>
                          );
                      })}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};