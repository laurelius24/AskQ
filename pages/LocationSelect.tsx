

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search, ChevronRight, ArrowLeft, Globe, MapPin, X, Loader2 } from 'lucide-react';
import { LocationType, LocationContext } from '../types';
import { translations } from '../translations';
import { loadGoogleMapsScript, searchCities, searchCountries, getCountryCode, GooglePlaceResult } from '../services/googlePlaces';

export const LocationSelect: React.FC = () => {
  const { availableLocations, setLocation, language, selectedLocation } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  // 'COUNTRY' or 'CITY'
  const [step, setStep] = useState<'COUNTRY' | 'CITY'>('COUNTRY');
  const [selectedCountry, setSelectedCountry] = useState<LocationContext | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedCountry, setSuggestedCountry] = useState<LocationContext | null>(null);
  const [combinedResults, setCombinedResults] = useState<any[]>([]);
  
  // Google Search State
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Simulate phone number detection (Czechia default)
  const mockUserPhoneCode = '420'; 

  // 1. Load Google Maps Script on Mount
  useEffect(() => {
      loadGoogleMapsScript().then(() => setIsGoogleLoaded(true));
  }, []);

  // 2. Suggest Country
  useEffect(() => {
      if (step === 'COUNTRY' && !searchQuery) {
          const found = availableLocations.find(l => l.type === LocationType.COUNTRY && l.phoneCode === mockUserPhoneCode);
          setSuggestedCountry(found || null);
      }
  }, [availableLocations, step, searchQuery]);

  // 3. Robust Search Effect (Local + Google Parallel)
  useEffect(() => {
      if (searchQuery.length > 1) {
          setIsSearching(true);
          
          const runSearch = async () => {
              // A. Define Local Matches based on Step
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

              // Format Local Results
              const localFormatted = localMatches.map(l => ({
                  id: l.id, // Keep existing ID
                  place_id: l.id, // Fallback
                  description: l.name,
                  structured_formatting: {
                      main_text: l.name,
                      secondary_text: step === 'COUNTRY' ? 'Country' : selectedCountry?.name
                  },
                  originalObj: l // Keep ref to full object for flags etc
              }));

              // SHOW LOCAL RESULTS IMMEDIATELY
              setCombinedResults(localFormatted);

              // B. Google Search (Async with Timeout)
              if (isGoogleLoaded) {
                  try {
                      const timeoutPromise = new Promise<GooglePlaceResult[]>((resolve) => 
                          setTimeout(() => resolve([]), 1000)
                      );
                      
                      let googlePromise;
                      if (step === 'COUNTRY') {
                          googlePromise = searchCountries(searchQuery);
                      } else if (step === 'CITY' && selectedCountry) {
                          // Use country ISO code (e.g. 'cz', 'de') as component restriction.
                          // If it's a Google country, we stored the isoCode in handleCountrySelect.
                          // If it's a local country, the ID is usually the code.
                          const code = selectedCountry.isoCode || (selectedCountry.id.length === 2 ? selectedCountry.id : undefined);
                          googlePromise = searchCities(searchQuery, code);
                      } else {
                          googlePromise = Promise.resolve([]);
                      }
                      
                      // Race against timeout
                      const googleRes = await Promise.race([googlePromise, timeoutPromise]);

                      if (googleRes && googleRes.length > 0) {
                          setCombinedResults(prev => {
                              const merged = [...prev];
                              googleRes.forEach(g => {
                                  // Avoid duplicates based on main text
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

          const timer = setTimeout(runSearch, 400); // Debounce
          return () => clearTimeout(timer);
      } else {
          setCombinedResults([]);
          setIsSearching(false);
      }
  }, [searchQuery, step, isGoogleLoaded, selectedCountry, availableLocations]);


  // Handlers
  const handleCountrySelect = async (item: any) => {
    setIsSearching(true);
    let countryCtx: LocationContext;

    if (item.originalObj) {
        // Local DB Country - usually id IS the code
        countryCtx = { ...item.originalObj, isoCode: item.originalObj.id };
    } else {
        // Google Result Country - Need to fetch ISO Code for future city searches
        const placeId = item.place_id;
        const fetchedIsoCode = await getCountryCode(placeId);
        
        countryCtx = {
            id: `gl_${placeId}`,
            name: item.structured_formatting.main_text,
            type: LocationType.COUNTRY,
            flagEmoji: '🌐', // Default for new Google countries
            parentId: null, // STRICT: Countries have NULL parent
            isoCode: fetchedIsoCode || undefined // Save the ISO code
        };
        // We don't need to save to DB yet, wait until city is selected or "All Country"
    }

    setSelectedCountry(countryCtx);
    setSearchQuery('');
    setStep('CITY');
    setCombinedResults([]);
    setIsSearching(false);
  };

  const handleCitySelect = async (location: any) => {
    if (!selectedCountry) return;

    // Check if it's a Google Result (needs converting) or Local
    let finalLoc: LocationContext;

    if (location.originalObj) {
        finalLoc = location.originalObj;
    } else if (location.place_id) {
        // Google Result
        finalLoc = {
            id: `gl_${location.place_id}`,
            name: location.structured_formatting.main_text,
            type: LocationType.CITY,
            parentId: selectedCountry.id // STRICT: Link to parent Country
        };
    } else {
        return;
    }

    // Ensure the country is saved first if it's new
    if (selectedCountry.id.startsWith('gl_')) {
        await setLocation(selectedCountry);
    }

    // This saves the city to Firestore 'locations' collection
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

  const renderResultItem = (item: any, isCity: boolean) => (
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
        <ChevronRight className="text-secondary" size={20} />
      </button>
  );

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
                            <ChevronRight className="text-secondary" size={20} />
                        </button>
                    </>
                )}
                
                {/* 2. Results (Local + Google) */}
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
                {/* Static "All Country" Option (Only if no search) */}
                {!searchQuery && (
                     <button
                        onClick={() => {
                            // Save country if new
                            if (selectedCountry.id.startsWith('gl_')) setLocation(selectedCountry);
                            setLocation(selectedCountry).then(() => navigate('/'));
                        }}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-all mb-4"
                    >
                        <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center text-xl shadow-sm">
                            <Globe size={20} className="text-primary" />
                        </div>
                        <div className="text-left flex-1">
                            <div className="font-bold text-white">{t['loc.all_country']} {selectedCountry.name}</div>
                            <div className="text-xs text-primary">{t['loc.general']}</div>
                        </div>
                        <ChevronRight className="text-primary" size={20} />
                    </button>
                )}

                {/* Default Popular Cities (If no search) */}
                {!searchQuery && (
                    <>
                        <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Popular Cities</h3>
                        {availableLocations
                            .filter(l => l.type === LocationType.CITY && l.parentId === selectedCountry.id)
                            .map(city => (
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
                                    <ChevronRight className="text-secondary" size={20} />
                                </button>
                            ))
                        }
                    </>
                )}

                {/* Search Results (Local + Google) */}
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