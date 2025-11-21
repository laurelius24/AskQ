import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search, ChevronRight, ArrowLeft, Globe, MapPin, X } from 'lucide-react';
import { LocationType, LocationContext } from '../types';
import { translations } from '../translations';

export const LocationSelect: React.FC = () => {
  const { availableLocations, setLocation, language, selectedLocation } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  // 'COUNTRY' or 'CITY'
  const [step, setStep] = useState<'COUNTRY' | 'CITY'>('COUNTRY');
  const [selectedCountry, setSelectedCountry] = useState<LocationContext | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedCountry, setSuggestedCountry] = useState<LocationContext | null>(null);

  // Simulate phone number detection
  // In a real app, this would come from Telegram API or user input
  // Mocking "420" for Czech Republic as default for demo
  const mockUserPhoneCode = '420'; 

  useEffect(() => {
      if (step === 'COUNTRY' && !searchQuery) {
          const found = availableLocations.find(l => l.type === LocationType.COUNTRY && l.phoneCode === mockUserPhoneCode);
          setSuggestedCountry(found || null);
      }
  }, [availableLocations, step, searchQuery]);

  // Derived Lists
  const countries = availableLocations.filter(l => l.type === LocationType.COUNTRY);
  
  const citiesInCountry = selectedCountry 
    ? availableLocations.filter(l => l.type === LocationType.CITY && l.parentId === selectedCountry.id)
    : [];

  // Filter logic
  const filteredItems = step === 'COUNTRY'
    ? countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : citiesInCountry.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Handlers
  const handleCountrySelect = (country: LocationContext) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setStep('CITY');
  };

  const handleCitySelect = (location: LocationContext) => {
    setLocation(location);
    navigate('/');
  };

  const handleBack = () => {
    if (step === 'CITY') {
      setStep('COUNTRY');
      setSelectedCountry(null);
      setSearchQuery('');
    } else if (selectedLocation) {
        // If user already has a location (is just changing it), allow going back to feed
        navigate(-1);
    }
  };

  const renderListItem = (item: LocationContext) => (
    <button
        key={item.id}
        onClick={() => step === 'COUNTRY' ? handleCountrySelect(item) : handleCitySelect(item)}
        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/5 shadow-sm hover:border-primary/50 active:scale-[0.98] transition-all bg-card mb-2"
      >
        <div className="w-10 h-10 rounded-full bg-input flex items-center justify-center text-2xl">
            {item.type === LocationType.CITY ? <MapPin size={24} className="text-primary" /> : item.flagEmoji}
        </div>
        <div className="text-left flex-1">
            <div className="font-bold text-white">{item.name}</div>
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
            />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
        {/* Option to select "Whole Country" if in City step */}
        {step === 'CITY' && selectedCountry && !searchQuery && (
             <button
                onClick={() => handleCitySelect(selectedCountry)}
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

        {step === 'COUNTRY' && !searchQuery && (
            <>
                {/* Suggested Country (Simulating phone number detection) */}
                {suggestedCountry && (
                    <>
                        <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 mt-2">
                            {t['loc.suggested']}
                        </h3>
                        {renderListItem(suggestedCountry)}
                    </>
                )}
                {/* Removed full list rendering here to hide countries until search */}
            </>
        )}
        
        {(step !== 'COUNTRY' || searchQuery) && (
            <>
                 <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                    {step === 'COUNTRY' ? t['loc.countries'] : t['loc.cities']}
                </h3>
                {filteredItems.map((item) => renderListItem(item))}
            </>
        )}

        {filteredItems.length === 0 && (
            <div className="text-center text-secondary py-10">
                {t['loc.not_found']}
            </div>
        )}
      </div>
    </div>
  );
};