
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search, ChevronRight, ArrowLeft, Globe, MapPin, X, Loader2, MessageCircle } from 'lucide-react';
import { LocationType, LocationContext } from '../types';
import { translations } from '../translations';
import { loadGoogleMapsScript, searchCities, searchCountries, getCountryCode, GooglePlaceResult, getFlagEmoji } from '../services/googlePlaces';

export const LocationSelect: React.FC = () => {
  const { availableLocations, setLocation, saveLocation, language, selectedLocation, questions } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  const [step, setStep] = useState<'COUNTRY' | 'CITY'>('COUNTRY');
  const [selectedCountry, setSelectedCountry] = useState<LocationContext | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedCountry, setSuggestedCountry] = useState<LocationContext | null>(null);
  const [combinedResults, setCombinedResults] = useState<any[]>([]);
  
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const mockUserPhoneCode = '420'; 

  useEffect(() => {
      loadGoogleMapsScript().then(() => setIsGoogleLoaded(true));
  }, []);

  // Calculate question counts per location
  const locationCounts = useMemo(() => {
      const counts: Record<string, number> = {};
      const parentMap = new Map<string, string>();
      
      // Map child locations to parents for aggregation
      availableLocations.forEach(l => {
          if (l.parentId) parentMap.set(l.id, l.parentId);
      });

      questions.forEach(q => {
          // Direct count (e.g. Question assigned to City or Country)
          counts[q.locationId] = (counts[q.locationId] || 0) + 1;
          
          // Parent aggregation (e.g. Question assigned to City adds to Country count)
          const pId = parentMap.get(q.locationId);
          if (pId) {
              counts[pId] = (counts[pId] || 0) + 1;
          }
      });
      return counts;
  }, [questions, availableLocations]);

  const getCount = (id?: string) => id ? (locationCounts[id] || 0) : 0;

  useEffect(() => {
      if (step === 'COUNTRY' && !searchQuery) {
          const found = availableLocations.find(l => l.type === LocationType.COUNTRY && l.phoneCode === mockUserPhoneCode);
          setSuggestedCountry(found || null);
      }
  }, [availableLocations, step, searchQuery]);

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
                          // Strict filtering: Use ISO code if available, else try ID (if local)
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
                      console.warn("Google Search failed or timed out", e);
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
        // Local DB Country
        countryCtx = { ...item.originalObj };
        
        // REPAIR LOGIC: If existing DB item is missing flag or isoCode, try to fix it now
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
             
             // 2. If we found a code, update the object (setLocation will save it to DB)
             if (code) {
                 countryCtx.isoCode = code;
                 if (!countryCtx.flagEmoji) countryCtx.flagEmoji = getFlagEmoji(code);
                 // Persist repair immediately
                 await saveLocation(countryCtx);
             }
        }

    } else {
        // Google Result Country - Fetch ISO Code for strict filtering
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
    }

    setSelectedCountry(countryCtx);
    setSearchQuery('');
    setStep('CITY');
    setCombinedResults([]);
    setIsSearching(false);
  };

  const handleCitySelect = async (location: any) => {
    if (!selectedCountry) return;

    let finalLoc: LocationContext;

    if (location.originalObj) {
        finalLoc = location.originalObj;
    } else if (location.place_id) {
        finalLoc = {
            id: `gl_${location.place_id}`,
            name: location.structured_formatting.main_text,
            type: LocationType.CITY,
            parentId: selectedCountry.id 
        };
    } else {
        return;
    }

    if (selectedCountry.id.startsWith('gl_')) {
        // Ensure parent country is saved/updated in DB with potential flag fixes
        await setLocation(selectedCountry);
    }

    await setLocation(finalLoc); 
    navigate('/');
  };

  const handleBack = () => {
    if (step === 'CITY') {
      setStep('COUNTRY');
      setSelectedCountry(null);
      setSearchQuery('');
      setCombinedResults([]);
    } else if (selectedLocation) {
        navigate(-1);
    }
  };

  const renderResultItem = (item: any, isCity: boolean) => {
    const itemId = item.originalObj?.id;
    const count = getCount(itemId);

    return (
      <button
          key={item.place_id || item.id}
          onClick={() => isCity ? handleCitySelect(item) : handleCountrySelect(item)}
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
      {/* Header */}
      <div className="shrink-0 p-4 flex items-center gap-3">
        {(step === 'CITY' || selectedLocation) && (
            <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white">
                {step === 'CITY' ? <ArrowLeft size={24} /> : <X size={24} />}
            </button>
        )}
        <div>
            <h2 className="text-2xl font-bold text-white">
                {step === 'COUNTRY' ? t['loc.title_country'] : `${t['loc.title_city']} ${selectedCountry?.name}`}
            </h2>
            <p className="text-secondary text-sm">
                {step === 'COUNTRY' ? t['loc.sub_country'] : t['loc.sub_city']}
            </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="shrink-0 px-4 mb-4">
        <div className="relative">
            <Search className="absolute left-3 top-3 text-secondary" size={20} />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={step === 'COUNTRY' ? t['loc.search_country'] : t['loc.search_city']}
                className="w-full bg-input text-white rounded-2xl py-3 pl-10 pr-4 outline-none border border-transparent focus:border-primary"
                autoFocus={false} 
            />
            {isSearching && (
                <div className="absolute right-3 top-3">
                    <Loader2 size={20} className="animate-spin text-primary" />
                </div>
            )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
        
        {/* === COUNTRY STEP === */}
        {step === 'COUNTRY' && (
            <>
                {/* 1. Suggestion (Only if no search) */}
                {!searchQuery && suggestedCountry && (
                    <>
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 mt-2">
                            {t['loc.suggested']}
                        </h3>
                        <button
                            onClick={() => handleCountrySelect({ originalObj: suggestedCountry, structured_formatting: { main_text: suggestedCountry.name } })}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all bg-card mb-2"
                        >
                            <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-2xl">
                                {suggestedCountry.flagEmoji}
                            </div>
                            <div className="text-left flex-1">
                                <div className="font-bold text-white">{suggestedCountry.name}</div>
                            </div>
                             {getCount(suggestedCountry.id) > 10 && (
                                <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-white/5 px-2 py-1 rounded-lg mr-1">
                                    <MessageCircle size={12} />
                                    {getCount(suggestedCountry.id)}
                                </div>
                             )}
                            <ChevronRight className="text-secondary" size={20} />
                        </button>
                    </>
                )}
                
                {/* 2. Results */}
                {searchQuery ? (
                    <>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2 mt-4">
                            {t['loc.countries']}
                        </h3>
                        {combinedResults.length > 0 ? (
                            combinedResults.map((item) => renderResultItem(item, false))
                        ) : (
                            !isSearching && <div className="text-center text-secondary py-10">{t['loc.not_found']}</div>
                        )}
                    </>
                ) : null}
            </>
        )}

        {/* === CITY STEP === */}
        {step === 'CITY' && selectedCountry && (
            <>
                {/* Static "All Country" Option */}
                {!searchQuery && (
                     <button
                        onClick={() => {
                            if (selectedCountry.id.startsWith('gl_')) setLocation(selectedCountry);
                            setLocation(selectedCountry).then(() => navigate('/'));
                        }}
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

                {/* Default Popular Cities */}
                {!searchQuery && (
                    <>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Popular Cities</h3>
                        {availableLocations
                            .filter(l => l.type === LocationType.CITY && l.parentId === selectedCountry.id)
                            .map(city => {
                                const count = getCount(city.id);
                                return (
                                    <button
                                        key={city.id}
                                        onClick={() => { setLocation(city); navigate('/'); }}
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
                            })
                        }
                    </>
                )}

                {/* Search Results */}
                {searchQuery && (
                    <>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                            Search Results
                        </h3>
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
