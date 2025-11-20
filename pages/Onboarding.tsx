import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { translations } from '../translations';
import { Camera, ArrowRight } from 'lucide-react';

// "Notionists" style: Black & White characters with vibrant backgrounds
const AVATARS = [
  'https://api.dicebear.com/9.x/notionists/svg?seed=Felix&backgroundColor=2563eb', // Blue
  'https://api.dicebear.com/9.x/notionists/svg?seed=Molly&backgroundColor=eab308', // Yellow
  'https://api.dicebear.com/9.x/notionists/svg?seed=Leo&backgroundColor=9333ea',   // Purple
  'https://api.dicebear.com/9.x/notionists/svg?seed=Betty&backgroundColor=dc2626', // Red
  'https://api.dicebear.com/9.x/notionists/svg?seed=Sawyer&backgroundColor=16a34a', // Green
  'https://api.dicebear.com/9.x/notionists/svg?seed=Bear&backgroundColor=0ea5e9',   // Cyan
];

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { registerUser, language } = useStore();
  const t = translations[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'WELCOME' | 'FORM'>('WELCOME');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) return;
    registerUser(name, username, selectedAvatar);
    navigate('/location');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') setSelectedAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (step === 'WELCOME') {
      return (
        <div className="h-screen flex flex-col justify-between px-6 py-10 bg-bg page-transition relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>

            <div className="flex-1 flex flex-col items-center justify-center z-10">
                <div className="w-40 h-40 mb-8 relative animate-bounce-slow">
                     <img 
                        src="https://cdn-icons-png.flaticon.com/512/7480/7480274.png" 
                        alt="Welcome" 
                        className="w-full h-full object-contain drop-shadow-2xl"
                    />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3 text-center leading-tight">
                    {t['onboard.welcome']}
                </h1>
                <p className="text-secondary text-center max-w-[260px] leading-relaxed">
                    {t['onboard.subtitle']}
                </p>
            </div>

            <div className="space-y-4 z-10 w-full shrink-0">
                <button 
                    onClick={() => setStep('FORM')}
                    className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-glow active:scale-[0.98] transition-transform"
                >
                    Start
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="h-screen flex flex-col bg-bg px-4 py-6 page-transition overflow-hidden">
        <div className="shrink-0 flex items-center mb-8">
            <button onClick={() => setStep('WELCOME')} className="p-2 -ml-2 text-white"><ArrowRight className="rotate-180" /></button>
            <span className="font-bold text-lg ml-2">Create Profile</span>
        </div>

        <div className="flex-1 overflow-y-auto pb-10 no-scrollbar">
            <form onSubmit={handleManualSubmit} className="flex flex-col h-full">
                <div className="flex justify-center mb-8">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 rounded-full overflow-hidden border-4 border-card bg-input relative group"
                    >
                        <img src={selectedAvatar} alt="avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={28} className="text-white" />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                    </button>
                </div>

                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    {AVATARS.map((avatar, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedAvatar(avatar)}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-primary scale-110 shadow-glow' : 'border-transparent opacity-50'}`}
                        >
                            <img src={avatar} alt={`option ${idx}`} className="w-full h-full object-cover" />
                        </button>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-secondary text-xs font-bold uppercase tracking-wider ml-1">
                            {t['onboard.name_label']}
                        </label>
                        <input 
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-input text-white rounded-2xl p-4 outline-none border border-transparent focus:border-primary transition-all"
                            placeholder="e.g. Alex"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-secondary text-xs font-bold uppercase tracking-wider ml-1">
                            {t['onboard.username_label']}
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-secondary font-bold">@</span>
                            <input 
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="w-full bg-input text-white rounded-2xl p-4 pl-9 outline-none border border-transparent focus:border-primary transition-all"
                                placeholder="username"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-10">
                    <button 
                        type="submit"
                        disabled={!name.trim() || !username.trim()}
                        className="w-full py-4 bg-primary text-white font-bold rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed shadow-glow active:scale-[0.98] transition-all"
                    >
                        {t['onboard.submit']}
                    </button>
                    <p className="text-center text-[10px] text-secondary mt-4 opacity-50">
                        {t['onboard.terms']}
                    </p>
                </div>
            </form>
        </div>
    </div>
  );
};