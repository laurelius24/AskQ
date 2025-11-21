

import React, { useState } from 'react';
import { useStore } from '../store';
import { Check, Calendar, Share2, User, Sparkles, Lock, Clock } from 'lucide-react';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';

export const Tasks: React.FC = () => {
  const { getTasks, checkAndClaimTask, language } = useStore();
  const t = translations[language];
  const [verifying, setVerifying] = useState<string | null>(null);

  const tasks = getTasks();

  const getTaskIcon = (iconName: string) => {
      switch(iconName) {
          case 'calendar': return <Calendar size={24} strokeWidth={1.5} />;
          case 'share': return <Share2 size={24} strokeWidth={1.5} />;
          case 'user': return <User size={24} strokeWidth={1.5} />;
          default: return <Sparkles size={24} strokeWidth={1.5} />;
      }
  };

  const handleClaim = async (task: any) => {
      if (task.status !== 'READY') return;

      if (task.type === 'SHARE') {
          setVerifying(task.id);
          // Simulate checking if user actually shared
          setTimeout(() => {
              checkAndClaimTask(task.type);
              setVerifying(null);
          }, 2000);
          
          // Trigger native share if possible
          if (navigator.share) {
              try {
                await navigator.share({ title: 'AskQ', text: 'Join me on AskQ!', url: window.location.href });
              } catch(e) {}
          }
      } else {
          checkAndClaimTask(task.type);
      }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['tasks.title']} />

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-24 no-scrollbar">
            {tasks.map(task => {
                const isLocked = task.status === 'LOCKED';
                const isCooldown = task.status === 'COOLDOWN';
                const isReady = task.status === 'READY';
                
                return (
                    <div key={task.id} className={`flex items-center justify-between p-4 rounded-2xl bg-card border border-white/5 ${isLocked ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/5">
                                {getTaskIcon(task.icon)}
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white">{t[task.title]}</div>
                                <div className="text-xs text-primary font-bold">+{task.reward} BLAST</div>
                                {task.progress && <div className="text-[10px] text-secondary mt-1">{task.progress}</div>}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleClaim(task)}
                            disabled={!isReady || verifying !== null}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center gap-2 min-w-[80px] justify-center ${
                                isReady 
                                ? 'bg-primary text-white shadow-glow active:scale-95' 
                                : 'bg-white/5 text-secondary cursor-not-allowed'
                            }`}
                        >
                            {verifying === task.id ? (
                                'Checking...'
                            ) : isLocked ? (
                                <Lock size={14} />
                            ) : isCooldown ? (
                                <Clock size={14} />
                            ) : (
                                t['tasks.start']
                            )}
                        </button>
                    </div>
                );
            })}
      </div>
    </div>
  );
};