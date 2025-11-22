
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, CAPITAL_IDS } from '../store';
import { Search, ChevronRight, Globe, MapPin, Loader2, MessageCircle } from 'lucide-react';
import { LocationType, LocationContext } from '../types';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';
import { loadGoogleMapsScript, searchCities, searchCountries, getCountryCode, GooglePlaceResult, getFlagEmoji } from '../services/googlePlaces';

export const SelectLocationForQuestion: React.FC = () => {
  const { availableLocations, updateQuestionDraft, language, saveLocation, questions } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  const [step, setStep] = useState<'COUNTRY' | 'CITY'>('COUNTRY');
  const [selectedCountry, setSelectedCountry] = useState<LocationContext | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [combinedResults, setCombinedResults] = useState<any[]>([]);
  
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
      loadGoogleMapsScript().then(() => setIsGoogleLoaded(true));
  }, []);

  // Calculate question counts
  const locationCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      const parentMap = new Map<string, string>();
      
      availableLocations.forEach(l => {
          if (l.parentId) parentMap.set(l.id, l.parentId);
      });

      questions.forEach(q => {
          counts[q.locationId] = (counts[q.locationId] || 0) + 1;
          const pId = parentMap.get(q.locationId);
          if (pId) {
              counts[pId] = (counts[pId] || 0) + 1;
          }
      });
      return counts;
  }, [questions, availableLocations]);

  const getCount = (id?: string) => id ? (locationCounts[id] || 0) : 0;

  useEffect(() => {
      if (searchQuery.length > 1) {
          setIsSearching(true);
          
          const runSearch = async () => {
              let localMatches: LocationContext[] = [];
              
              if (step === 'COUNTRY') {
                  localMatches = availableLocations.filter(l => 
                      l.type === LocationType.COUNTRY && 
                      l.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
              } else if (step === 'CITY' && selectedCountry) {
                  localMatches = availableLocations.filter(l => 
                      l.type === LocationType.CITY && 
                      l.parentId === selectedCountry.id && 
                      l.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );
              }

              const localFormatted = localMatches.map(l => ({
                  id: l.id,
                  place_id: l.id,
                  description: l.name,
                  structured_formatting: {
                      main_text: l.name,
                      secondary_text: step === 'COUNTRY' ? 'Country' : selectedCountry?.name
                  },
                  originalObj: l
              }));

              setCombinedResults(localFormatted);

              if (isGoogleLoaded) {
                  try {
                      const timeoutPromise = new Promise<GooglePlaceResult[]>((resolve) => 
                          setTimeout(() => resolve([]), 1000)
                      );
                      
                      let googlePromise;
                      if (step === 'COUNTRY') {
                          googlePromise = searchCountries(searchQuery);
                      } else if (step === 'CITY' && selectedCountry) {
                          const code = selectedCountry.isoCode || (selectedCountry.id.length === 2 ? selectedCountry.id : undefined);
                          googlePromise = searchCities(searchQuery, code);
                      } else {
                          googlePromise = Promise.resolve([]);
                      }

                      const googleRes = await Promise.race([googlePromise, timeoutPromise]);

                      if (googleRes && googleRes.length > 0) {
                          setCombinedResults(prev => {
                              const merged = [...prev];
                              googleRes.forEach(g => {
                                  if (!merged.some(existing => existing.structured_formatting.main_text === g.structured_formatting.main_text)) {
                                      merged.push(g);
                                  }
                              });
                              return merged;
                          });
                      }
                  } catch (e) {
                      console.warn("Google Search failed", e);
                  }
              }
              setIsSearching(false);
          };

          const timer = setTimeout(runSearch, 400);
          return () => clearTimeout(timer);
      } else {
          setCombinedResults([]);
          setIsSearching(false);
      }
  }, [searchQuery, step, isGoogleLoaded, selectedCountry, availableLocations]);

  const handleCountrySelect = async (item: any) => {
    setIsSearching(true);
    let countryCtx: LocationContext;

    if (item.originalObj) {
        countryCtx = { ...item.originalObj };
        // REPAIR: If existing DB item is missing flag or isoCode, try to fix it now
        if (countryCtx.type === LocationType.COUNTRY && (!countryCtx.flagEmoji || !countryCtx.isoCode)) {
             let code = countryCtx.isoCode;
             
             // 1. If no ISO code, try to fetch or infer it
             if (!code) {
                 if (countryCtx.id.startsWith('gl_')) {
                     // Google ID: fetch details
                     const placeId = countryCtx.id.replace('gl_', '');
                     try {
                         const fetched = await getCountryCode(placeId);
                         if (fetched) code = fetched;
                     } catch(e) { console.warn("Failed to fetch ISO for", countryCtx.name); }
                 } else if (countryCtx.id.length === 2) {
                     // Standard 2-letter ID
                     code = countryCtx.id;
                 }
             }
             
             // 2. If we found a code, update the object
             if (code) {
                 countryCtx.isoCode = code;
                 if (!countryCtx.flagEmoji) countryCtx.flagEmoji = getFlagEmoji(code);
                 // Explicitly save repaired object to DB
                 await saveLocation(countryCtx);
             }
        }
    } else {
        const placeId = item.place_id;
        const fetchedIsoCode = await getCountryCode(placeId);

        countryCtx = {
            id: `gl_${placeId}`,
            name: item.structured_formatting.main_text,
            type: LocationType.COUNTRY,
            flagEmoji: getFlagEmoji(fetchedIsoCode),
            parentId: null, 
            isoCode: fetchedIsoCode || undefined
        };
        await saveLocation(countryCtx);
    }

    setSelectedCountry(countryCtx);
    setSearchQuery('');
    setStep('CITY');
    setCombinedResults([]);
    setIsSearching(false);
  };

  const handleFinalSelect = async (locationItem: any) => {
    let finalLoc: LocationContext;

    if (locationItem.originalObj) {
        finalLoc = locationItem.originalObj;
    } else if (locationItem.place_id) {
        finalLoc = {
            id: `gl_${locationItem.place_id}`,
            name: locationItem.structured_formatting.main_text,
            type: LocationType.CITY,
            parentId: selectedCountry!.id
        };
        await saveLocation(finalLoc);
    } else {
        finalLoc = locationItem as LocationContext;
    }

    updateQuestionDraft({ locationId: finalLoc.id });
    navigate(-1);
  };

  const handleBack = () => {
    if (step === 'CITY') {
      setStep('COUNTRY');
      setSelectedCountry(null);
      setSearchQuery('');
      setCombinedResults([]);
    } else {
        navigate(-1);
    }
  };

  const getDefaultCities = () => {
      if (!selectedCountry) return [];
      return availableLocations
        .filter(l => l.type === LocationType.CITY && l.parentId === selectedCountry.id)
        .sort((a, b) => {
            const aCap = CAPITAL_IDS.has(a.id);
            const bCap = CAPITAL_IDS.has(b.id);
            if (aCap && !bCap) return -1;
            if (!aCap && bCap) return 1;
            return a.name.localeCompare(b.name);
        });
  };

  const renderResultItem = (item: any, isCity: boolean) => {
    const itemId = item.originalObj?.id;
    const count = getCount(itemId);

    return (
      <button
          key={item.place_id || item.id}
          onClick={() => isCity ? handleFinalSelect(item) : handleCountrySelect(item)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all bg-card mb-2"
        >
          <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-2xl">
              {isCity ? <MapPin size={24} className="text-primary" /> : (item.originalObj?.flagEmoji || <Globe size={24} className="text-secondary" />)}
          </div>
          <div className="text-left flex-1">
              <div className="font-bold text-white">{item.structured_formatting.main_text}</div>
              {!item.originalObj && <span className="text-[10px] text-secondary">Google Search</span>}
          </div>
          {count > 10 && (
             <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-white/5 px-2 py-1 rounded-lg mr-1">
                 <MessageCircle size={12} />
                 {count}
             </div>
          )}
          <ChevronRight className="text-secondary" size={20} />
        </button>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['ask.select_loc_title']} onBack={handleBack} />

      <div className="shrink-0 px-4 py-4">
        <div className="relative">
            <Search className="absolute left-3 top-3 text-secondary" size={20} />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={step === 'COUNTRY' ? t['loc.search_country'] : t['loc.search_city']}
                className="w-full bg-input text-white rounded-2xl py-3 pl-10 pr-4 outline-none border border-transparent focus:border-primary"
                autoFocus
            />
            {isSearching && (
                <div className="absolute right-3 top-3">
                    <Loader2 size={20} className="animate-spin text-primary" />
                </div>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
        {step === 'COUNTRY' && (
            <>
                {!searchQuery && (
                    availableLocations
                        .filter(l => l.type === LocationType.COUNTRY)
                        .map(item => {
                            const count = getCount(item.id);
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleCountrySelect({ originalObj: item, structured_formatting: { main_text: item.name } })}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all bg-card mb-2"
                                >
                                    <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-2xl">
                                        {item.flagEmoji}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-bold text-white">{item.name}</div>
                                    </div>
                                    {count > 10 && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-white/5 px-2 py-1 rounded-lg mr-1">
                                            <MessageCircle size={12} />
                                            {count}
                                        </div>
                                    )}
                                    <ChevronRight className="text-secondary" size={20} />
                                </button>
                            );
                        })
                )}
                {searchQuery && (
                    <>
                        {combinedResults.map(item => renderResultItem(item, false))}
                        {combinedResults.length === 0 && !isSearching && (
                            <div className="text-center text-secondary py-10">{t['loc.not_found']}</div>
                        )}
                    </>
                )}
            </>
        )}

        {step === 'CITY' && selectedCountry && (
            <>
                {!searchQuery && (
                     <button
                        onClick={() => handleFinalSelect({ originalObj: selectedCountry })}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all mb-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-xl shadow-sm">
                            {selectedCountry.flagEmoji || <Globe size={20} className="text-primary" />}
                        </div>
                        <div className="text-left flex-1">
                            <div className="font-bold text-white">{t['loc.all_country']} {selectedCountry.name}</div>
                            <div className="text-xs text-primary">{t['loc.general']}</div>
                        </div>
                        {getCount(selectedCountry.id) > 10 && (
                             <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-white/5 px-2 py-1 rounded-lg mr-1">
                                 <MessageCircle size={12} />
                                 {getCount(selectedCountry.id)}
                             </div>
                         )}
                        <ChevronRight className="text-primary" size={20} />
                    </button>
                )}

                {!searchQuery && (
                    <>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Popular Cities</h3>
                        {getDefaultCities().map(city => {
                            const count = getCount(city.id);
                            return (
                                <button
                                    key={city.id}
                                    onClick={() => handleFinalSelect({ originalObj: city })}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all bg-card mb-2"
                                >
                                    <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-2xl">
                                        <MapPin size={24} className="text-primary" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-bold text-white">{city.name}</div>
                                    </div>
                                    {count > 10 && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-white/5 px-2 py-1 rounded-lg mr-1">
                                            <MessageCircle size={12} />
                                            {count}
                                        </div>
                                    )}
                                    <ChevronRight className="text-secondary" size={20} />
                                </button>
                            );
                        })}
                    </>
                )}

                {searchQuery && (
                    <>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Results</h3>
                        {combinedResults.map((item) => renderResultItem(item, true))}
                        
                        {combinedResults.length === 0 && !isSearching && (
                            <div className="text-center text-secondary py-10">{t['loc.not_found']}</div>
                        )}
                    </>
                )}
            </>
        )}
      </div>
    </div>
  );
};
