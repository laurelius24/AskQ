import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search as SearchIcon, ArrowRight, TrendingUp, MapPin, Globe } from 'lucide-react';
import { translations } from '../translations';
import { LocationType } from '../types';

type SearchScope = 'CITY' | 'COUNTRY' | 'GLOBAL';

export const Search: React.FC = () => {
  const { language, questions, selectedLocation, availableLocations } = useStore();
  const navigate = useNavigate();
  const t = translations[language];
  
  const [query, setQuery] = useState('');
  
  const isCitySelected = selectedLocation?.type === LocationType.CITY;
  const [scope, setScope] = useState<SearchScope>(isCitySelected ? 'CITY' : 'COUNTRY');

  const parentCountry = useMemo(() => {
    if (!selectedLocation) return null;
    if (selectedLocation.type === LocationType.COUNTRY) return selectedLocation;
    return availableLocations.find(l => l.id === selectedLocation.parentId);
  }, [selectedLocation, availableLocations]);

  const filteredQuestions = useMemo(() => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    
    const textMatches = questions.filter(q => 
        q.text.toLowerCase().includes(lowerQuery) || 
        q.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );

    return textMatches.filter(q => {
        if (scope === 'GLOBAL') return true;
        if (scope === 'COUNTRY') {
            if (!parentCountry) return true; 
            if (q.locationId === parentCountry.id) return true;
            const qLoc = availableLocations.find(l => l.id === q.locationId);
            return qLoc?.parentId === parentCountry.id;
        }
        if (scope === 'CITY') {
            return q.locationId === selectedLocation?.id;
        }
        return true;
    });
  }, [query, scope, questions, selectedLocation, parentCountry, availableLocations]);

  const popularQuestions = useMemo(() => {
      let pool = questions;
      if (selectedLocation) {
        pool = questions.filter(q => q.locationId === selectedLocation.id || (parentCountry && q.locationId === parentCountry.id));
        if (pool.length === 0) pool = questions;
      }
      return [...pool].sort((a, b) => b.views - a.views).slice(0, 3);
  }, [questions, selectedLocation, parentCountry]);

  return (
    <div className="pb-24 pt-6 px-4 min-h-screen bg-bg page-transition">
       <h1 className="text-2xl font-bold mb-4 text-white">{t['search.title']}</h1>
       
       {/* Search Input */}
       <div className="relative mb-5">
            <SearchIcon className="absolute left-3 top-3.5 text-secondary" size={20} />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t['search.placeholder']}
                className="w-full bg-input text-white rounded-2xl py-3.5 pl-10 pr-4 outline-none border border-transparent focus:border-primary transition-all"
                autoFocus
            />
       </div>

       {/* Scope Selectors */}
       {query && selectedLocation && (
         <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
            {isCitySelected && (
                <button 
                    onClick={() => setScope('CITY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-colors ${
                        scope === 'CITY' 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-card text-secondary border-white/10 hover:bg-white/10'
                    }`}
                >
                    <MapPin size={12} />
                    {selectedLocation.name} ({t['search.scope_city']})
                </button>
            )}

            {parentCountry && (
                <button 
                    onClick={() => setScope('COUNTRY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-colors ${
                        scope === 'COUNTRY' 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-card text-secondary border-white/10 hover:bg-white/10'
                    }`}
                >
                    <span>{parentCountry.flagEmoji}</span>
                    {parentCountry.name} ({t['search.scope_country']})
                </button>
            )}

            <button 
                onClick={() => setScope('GLOBAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-colors ${
                    scope === 'GLOBAL' 
                    ? 'bg-primary text-white border-primary' 
                    : 'bg-card text-secondary border-white/10 hover:bg-white/10'
                }`}
            >
                <Globe size={12} />
                {t['search.scope_global']}
            </button>
         </div>
       )}

       {/* Content Area */}
       {query ? (
           <div className="space-y-4">
               {filteredQuestions.length > 0 ? (
                   filteredQuestions.map(q => (
                        <div 
                            key={q.id}
                            onClick={() => navigate(`/question/${q.id}`)}
                            className="p-4 rounded-2xl border border-white/5 bg-card shadow-sm flex items-center justify-between active:bg-white/5 cursor-pointer"
                        >
                            <div className="flex-1 mr-4">
                                <div className="text-sm font-semibold text-white line-clamp-2">{q.text}</div>
                                <div className="flex gap-2 mt-2 items-center">
                                    {scope !== 'CITY' && (
                                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            <MapPin size={8} />
                                            {availableLocations.find(l => l.id === q.locationId)?.name}
                                        </span>
                                    )}
                                    {q.tags.map(tag => (
                                        <span key={tag} className="text-[10px] text-secondary bg-input px-1.5 py-0.5 rounded">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <ArrowRight size={18} className="text-secondary" />
                        </div>
                   ))
               ) : (
                   <div className="text-center text-secondary mt-10 flex flex-col items-center gap-2">
                       <SearchIcon size={48} className="opacity-10" />
                       <p>{t['search.no_results']}</p>
                       {scope === 'CITY' && parentCountry && (
                           <button onClick={() => setScope('COUNTRY')} className="text-primary text-sm font-bold">
                               Try searching in {parentCountry.name}
                           </button>
                       )}
                   </div>
               )}
           </div>
       ) : (
           <div>
               <div className="flex items-center gap-2 mb-4 text-secondary uppercase text-xs font-bold tracking-wider">
                    <TrendingUp size={14} />
                    {t['search.popular']}
               </div>
               <div className="space-y-3">
                    {popularQuestions.map(q => (
                        <button 
                            key={q.id}
                            onClick={() => navigate(`/question/${q.id}`)}
                            className="w-full text-left p-4 rounded-2xl bg-card hover:bg-white/5 transition-colors border border-white/5"
                        >
                            <div className="text-sm font-medium text-white">{q.text}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-secondary">{q.views} views</span>
                                <span className="text-[10px] text-primary bg-primary/10 px-1.5 rounded">
                                    {availableLocations.find(l => l.id === q.locationId)?.name}
                                </span>
                            </div>
                        </button>
                    ))}
               </div>
           </div>
       )}
    </div>
  );
};