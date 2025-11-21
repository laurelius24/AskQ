

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Search, ChevronRight, Globe, MapPin } from 'lucide-react';
import { LocationType, LocationContext } from '../types';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';

export const SelectLocationForQuestion: React.FC = () => {
  const { availableLocations, updateQuestionDraft, language } = useStore();
  const navigate = useNavigate();
  const t = translations[language];

  const [step, setStep] = useState<'COUNTRY' | 'CITY'>('COUNTRY');
  const [selectedCountry, setSelectedCountry] = useState<LocationContext | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const countries = availableLocations.filter(l => l.type === LocationType.COUNTRY);
  const citiesInCountry = selectedCountry 
    ? availableLocations.filter(l => l.type === LocationType.CITY && l.parentId === selectedCountry.id)
    : [];

  const filteredItems = step === 'COUNTRY'
    ? countries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : citiesInCountry.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCountrySelect = (country: LocationContext) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setStep('CITY');
  };

  const handleFinalSelect = (location: LocationContext) => {
    updateQuestionDraft({ locationId: location.id });
    navigate(-1);
  };

  const handleBack = () => {
    if (step === 'CITY') {
      setStep('COUNTRY');
      setSelectedCountry(null);
      setSearchQuery('');
    } else {
        navigate(-1);
    }
  };

  const renderListItem = (item: LocationContext) => (
    <button
        key={item.id}
        onClick={() => step === 'COUNTRY' ? handleCountrySelect(item) : handleFinalSelect(item)}
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
      <PageHeader title={t['ask.select_loc_title']} onBack={handleBack} />

      {/* Search Bar */}
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
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-10 no-scrollbar">
        {step === 'CITY' && selectedCountry && !searchQuery && (
             <button
                onClick={() => handleFinalSelect(selectedCountry)}
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

        {filteredItems.map((item) => renderListItem(item))}

        {filteredItems.length === 0 && (
            <div className="text-center text-secondary py-10">
                {t['loc.not_found']}
            </div>
        )}
      </div>
    </div>
  );
};