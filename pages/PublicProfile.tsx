

import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import { MessageCircle, Link as LinkIcon, ThumbsUp, Trash2, MapPin } from 'lucide-react';
import { translations } from '../translations';
import { LocationType } from '../types';
import { PageHeader } from '../components/PageHeader';

export const PublicProfile: React.FC = () => {
  const { userId } = useParams();
  const { getUserById, language, questions, currentUser, deleteQuestion, availableLocations } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  // Get initial tab from navigation state or default to questions
  const [activeTab, setActiveTab] = useState<'questions' | 'answers'>((location.state as any)?.initialTab || 'questions');

  const user = userId ? getUserById(userId) : null;
  const isMe = currentUser?.id === userId;

  const handleDeleteQuestion = async (e: React.MouseEvent, questionId: string) => {
      e.stopPropagation();
      if (window.confirm(t['q.delete_q_confirm'])) {
          await deleteQuestion(questionId);
      }
  };

  if (!user) {
      return (
          <div className="flex flex-col items-center justify-center h-screen text-secondary bg-bg">
              <PageHeader title="" />
              {t['pub.not_found']}
          </div>
      );
  }

  // Filter User Content
  const userQuestions = questions.filter(q => q.authorId === user.id);
  const userLocation = availableLocations.find(l => l.id === user.currentLocationId);

  return (
    <div className="pb-24 bg-bg min-h-screen text-white page-transition">
       <PageHeader title={user.displayName} className="bg-bg/95 backdrop-blur-xl" />

       <div className="p-4 space-y-6">
            {/* 1. Name, Bio and Picture */}
            <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-card overflow-hidden border-2 border-white/10 shadow-md shrink-0">
                    <img src={user.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{user.displayName}</h2>
                    <p className="text-secondary text-sm mb-2 font-medium">@{user.username}</p>
                    
                    {user.bio && (
                        <p className="text-sm text-white/80 mb-3 leading-relaxed">{user.bio}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-3">
                        {userLocation && (
                            <div className="inline-flex items-center gap-1 text-xs font-medium text-secondary bg-white/5 px-2 py-1 rounded-lg">
                                {userLocation.type === LocationType.CITY ? <MapPin size={12} /> : <span>{userLocation.flagEmoji}</span>}
                                {userLocation.name}
                            </div>
                        )}

                        {user.websiteUrl && (
                            <a 
                                href={user.websiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline bg-primary/10 px-2 py-1 rounded-lg"
                            >
                                <LinkIcon size={12} />
                                {t['prof.visit_link']}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4 p-4 bg-card border border-white/5 rounded-2xl shadow-sm">
                <div className="flex-1 text-center">
                     <div className="text-lg font-bold text-white">{userQuestions.length}</div>
                     <div className="text-xs text-secondary font-bold uppercase tracking-wider">{t['prof.stats.q']}</div>
                </div>
                <div className="w-px bg-white/10"></div>
                <div className="flex-1 text-center">
                     <div className="text-lg font-bold text-white">{user.reputationScore}</div>
                     <div className="text-xs text-secondary font-bold uppercase tracking-wider">{t['prof.stats.rep']}</div>
                </div>
            </div>

            {/* 3. Tabs */}
            <div>
                <div className="flex p-1 bg-card border border-white/5 rounded-xl mb-4 overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('questions')}
                        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeTab === 'questions' 
                            ? 'bg-white/10 text-white shadow-sm' 
                            : 'text-secondary hover:text-white'
                        }`}
                    >
                        {t['prof.tab.questions']}
                    </button>
                    
                     <button 
                        onClick={() => setActiveTab('answers')}
                        className={`flex-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            activeTab === 'answers' 
                            ? 'bg-white/10 text-white shadow-sm' 
                            : 'text-secondary hover:text-white'
                        }`}
                    >
                        {t['prof.tab.answers']}
                    </button>
                </div>

                <div className="space-y-3">
                    {activeTab === 'questions' && (
                        userQuestions.length > 0 ? (
                            userQuestions.map(q => {
                                const createdTime = new Date(q.createdAt).getTime();
                                const timeDiff = Date.now() - createdTime;
                                const canDelete = isMe && timeDiff < 24 * 60 * 60 * 1000;

                                return (
                                    <div 
                                        key={q.id} 
                                        onClick={() => navigate(`/question/${q.id}`)} 
                                        className="p-4 rounded-2xl border border-white/5 bg-card flex gap-3 items-start active:scale-[0.99] active:bg-white/5 transition-all cursor-pointer relative group"
                                    >
                                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl shrink-0">
                                            <MessageCircle size={20} strokeWidth={1.5} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-white text-sm mb-1.5 pr-8 leading-snug truncate">{q.title}</div>
                                            <div className="text-xs text-secondary flex items-center gap-3">
                                                <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                                                <div className="flex items-center gap-1">
                                                    <ThumbsUp size={12}/> 
                                                    <span className="font-bold">{q.likes}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle size={12}/> 
                                                    <span className="font-bold">0</span>
                                                </div>
                                            </div>
                                        </div>
                                        {canDelete && (
                                            <button 
                                                onClick={(e) => handleDeleteQuestion(e, q.id)}
                                                className="absolute top-3 right-3 p-2 text-secondary/50 hover:text-danger hover:bg-danger/10 rounded-full transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-12 text-secondary text-sm flex flex-col items-center gap-2 opacity-60">
                                <MessageCircle size={32} strokeWidth={1} />
                                {t['feed.empty']}
                            </div>
                        )
                    )}

                    {activeTab === 'answers' && (
                        <div className="text-center py-12 text-secondary text-sm flex flex-col items-center gap-2 opacity-60">
                             <MessageCircle size={32} strokeWidth={1} />
                             <p>No answers yet</p>
                        </div>
                    )}
                </div>
            </div>
       </div>
    </div>
  );
};