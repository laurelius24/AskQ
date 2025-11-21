

import React from 'react';
import { useStore } from '../store';
import { Check, Calendar, Share2, User, Sparkles } from 'lucide-react';
import { translations } from '../translations';
import { PageHeader } from '../components/PageHeader';

export const Tasks: React.FC = () => {
  const { tasks, claimTaskReward, language } = useStore();
  const t = translations[language];

  const activeTasks = tasks.filter(t => !t.isCompleted);
  const doneTasks = tasks.filter(t => t.isCompleted);

  const getTaskIcon = (iconName: string) => {
      switch(iconName) {
          case 'calendar': return <Calendar size={24} strokeWidth={1.5} />;
          case 'share': return <Share2 size={24} strokeWidth={1.5} />;
          case 'user': return <User size={24} strokeWidth={1.5} />;
          default: return <Sparkles size={24} strokeWidth={1.5} />;
      }
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      <PageHeader title={t['tasks.title']} />

      <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24 no-scrollbar">
        
        {/* Active Tasks */}
        <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">{t['tasks.section_active']}</h2>
            
            {activeTasks.length === 0 && (
                <div className="text-secondary text-sm py-4 opacity-50">No active tasks</div>
            )}

            {activeTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-white border border-white/5">
                            {getTaskIcon(task.icon)}
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{t[task.title]}</div>
                            <div className="text-xs text-secondary font-medium">+{task.reward} {t['tasks.reward_suffix']}</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => claimTaskReward(task.id)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-colors border border-white/5 active:scale-95"
                    >
                        {t['tasks.start']}
                    </button>
                </div>
            ))}
        </div>

        {/* Done Tasks */}
        {doneTasks.length > 0 && (
             <div className="space-y-4 pt-4 border-t border-white/5">
                <h2 className="text-sm font-bold text-white">{t['tasks.section_done']}</h2>
                
                {doneTasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-white/50 border border-white/5">
                                <Check size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-medium text-white line-through">{t[task.title]}</div>
                            </div>
                        </div>
                        <div className="text-xs font-bold text-white">
                            + {task.reward} {t['tasks.reward_suffix']}
                        </div>
                    </div>
                ))}
            </div>
        )}

      </div>
    </div>
  );
};