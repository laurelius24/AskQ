

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { MapPin, Save, Globe, AtSign, Camera, User } from 'lucide-react';
import { translations } from '../translations';
import { LocationType } from '../types';
import { PageHeader } from '../components/PageHeader';
import { PrimaryButton } from '../components/PrimaryButton';

const InputGroup = ({ label, children, icon: Icon }: any) => (
    <div className="space-y-2">
        <label className="block text-xs font-bold text-secondary uppercase tracking-wider ml-1">
            {label}
        </label>
        <div className="relative">
          {Icon && <Icon className="absolute left-4 top-4 text-secondary" size={20} />}
          {children}
        </div>
    </div>
);

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, selectedLocation, language } = useStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [link, setLink] = useState(currentUser?.websiteUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  
  const handleSave = () => {
    updateUserProfile({
        displayName: name,
        username: username,
        bio: bio,
        websiteUrl: link,
        avatarUrl: avatarUrl
    });
    navigate('/profile');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['prof.settings']} />

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-24 no-scrollbar">
        
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*"/>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-card group shadow-lg bg-input"
            >
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                    <Camera className="text-white" size={28} />
                </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="text-primary text-xs font-bold mt-3 active:opacity-80">
                Change Photo
            </button>
        </div>

        {/* Location Card */}
        <div className="p-1 rounded-2xl bg-card border border-white/5">
             <div className="flex items-center justify-between p-4 border-b border-white/5">
                 <div className="flex items-center gap-2 text-white font-bold text-sm">
                     <MapPin size={16} className="text-primary" />
                     {t['prof.curr_loc']}
                 </div>
             </div>
             <div className="p-4 flex items-center justify-between">
                 <div className="font-bold text-white flex items-center gap-2">
                    {selectedLocation?.type === LocationType.CITY 
                        ? <MapPin size={20} className="text-primary" /> 
                        : <span className="text-2xl">{selectedLocation?.flagEmoji}</span>
                    } 
                    {selectedLocation?.name}
                 </div>
                 <button 
                    onClick={() => navigate('/location')}
                    className="px-4 py-2 bg-input text-white font-bold rounded-xl text-xs active:bg-white/10 transition-colors"
                 >
                    Change
                 </button>
             </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
            <InputGroup label={t['onboard.name_label']} icon={User}>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-input text-white rounded-2xl py-4 pl-12 pr-4 outline-none border border-transparent focus:border-white/30 transition-all font-medium"
                />
            </InputGroup>

            <InputGroup label={t['onboard.username_label']} icon={AtSign}>
                <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full bg-input text-white rounded-2xl py-4 pl-12 pr-4 outline-none border border-transparent focus:border-white/30 transition-all font-medium"
                />
            </InputGroup>

            <InputGroup label={t['onboard.bio_label']}>
                <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={120}
                    rows={3}
                    className="w-full bg-input text-white rounded-2xl p-4 outline-none border border-transparent focus:border-white/30 resize-none leading-relaxed"
                />
            </InputGroup>

            <InputGroup label={t['onboard.link_label']} icon={Globe}>
                <input 
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full bg-input text-white rounded-2xl py-4 pl-12 pr-4 outline-none border border-transparent focus:border-white/30 transition-all font-medium"
                />
            </InputGroup>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-bg border-t border-white/5 z-20">
        <PrimaryButton onClick={handleSave}>
            <Save size={20} />
            {t['settings.save']}
        </PrimaryButton>
      </div>
    </div>
  );
};