

import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ThumbsUp, Gift, VenetianMask } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { Answer, User } from '../types';
import { PageHeader } from '../components/PageHeader';

// ... (Keep existing helper functions formatText, formatDate) ...
const formatText = (text: string) => {
    if (!text) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
        if (part.match(urlRegex)) {
            try {
                const url = new URL(part);
                return (
                    <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary font-medium break-all hover:underline">
                        {url.hostname}
                    </a>
                );
            } catch (e) { return part; }
        }
        return part;
    });
    // ... (rest of formatText implementation)
};

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    } catch(e) { return dateString; }
};

export const QuestionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, language, getUserById, getAllUsers, toggleLike, questions, subscribeToAnswers, answers, addAnswer } = useStore();
  const t = translations[language];
  
  useEffect(() => {
      if (id) {
          const unsub = subscribeToAnswers(id);
          return () => unsub();
      }
  }, [id, subscribeToAnswers]);

  const currentAnswers = answers[id!] || [];
  const storeQuestion = questions.find(q => q.id === id);

  const [tippingAnswerId, setTippingAnswerId] = useState<string | null>(null);
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  const [mainAnswerText, setMainAnswerText] = useState('');
  const [mainAnswerImage, setMainAnswerImage] = useState<string | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  
  const allUsers = getAllUsers();
  const filteredUsers = useMemo(() => {
      if (mentionQuery === null) return [];
      const q = mentionQuery.toLowerCase();
      // Cast Object.values to User[] to avoid type error
      return (Object.values(allUsers) as User[]).filter(u => 
          u.username.toLowerCase().includes(q) || 
          u.displayName.toLowerCase().includes(q)
      );
  }, [mentionQuery, allUsers]);

  if (!storeQuestion) return <div className="p-10 text-white text-center">Loading or Not Found...</div>;

  const questionAuthor = getUserById(storeQuestion.authorId);
  const isQuestionLiked = currentUser?.likedEntityIds.includes(storeQuestion.id || '');

  const handleLikeQuestion = () => toggleLike(storeQuestion.id, 'QUESTION');
  const handleLikeAnswer = (aid: string) => toggleLike(aid, 'ANSWER');

  const handleSubmitMainAnswer = async () => {
      if (!mainAnswerText.trim() && !mainAnswerImage) return;
      await addAnswer(storeQuestion.id, mainAnswerText, mainAnswerImage ? [mainAnswerImage] : []);
      setMainAnswerText('');
      setMainAnswerImage(null);
  };

  // Define AnswerItem as a functional component to handle props correctly
  const AnswerItem: React.FC<{ answer: Answer }> = ({ answer }) => {
      const isLiked = currentUser?.likedEntityIds.includes(answer.id);
      return (
        <div className={`p-4 rounded-3xl border mb-3 bg-card border-white/5`}>
             <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{answer.authorName}</span>
                    <span className="text-xs text-secondary">• {formatDate(answer.createdAt)}</span>
                </div>
             </div>
             <div className="text-gray-300 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{formatText(answer.text)}</div>
             
             {answer.attachmentUrls?.map((url, i) => (
                 <img key={i} src={url} className="w-28 h-28 rounded-xl object-cover mb-2" onClick={() => setFullScreenImage(url)} alt="attachment" />
             ))}

             <div className="flex items-center justify-between mt-2">
                <div className="flex gap-3">
                    <button onClick={() => handleLikeAnswer(answer.id)} className={`flex items-center gap-1.5 ${isLiked ? 'text-primary' : 'text-secondary'}`}>
                        <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                        <span className="font-bold text-xs">{answer.likes}</span>
                    </button>
                </div>
                <button onClick={() => setTippingAnswerId(answer.id)} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-xs font-bold text-secondary">
                    <Gift size={14} /> Gift
                </button>
             </div>
        </div>
      );
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white overflow-hidden">
        <PageHeader title={t['q.question']} className="bg-bg/90 backdrop-blur-md" />

        <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
            <div className="bg-card p-5 rounded-3xl shadow-sm border border-white/5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 bg-input rounded-full flex items-center justify-center overflow-hidden">
                         {storeQuestion.isAnonymous ? <VenetianMask size={20}/> : <img src={questionAuthor?.avatarUrl} className="w-full h-full" alt="avatar" />}
                     </div>
                     <div>
                         <div className="text-sm font-bold text-white">{storeQuestion.isAnonymous ? t['q.anonymous'] : questionAuthor?.displayName}</div>
                         <div className="text-xs text-secondary">{formatDate(storeQuestion.createdAt)}</div>
                     </div>
                </div>
                <h1 className="text-xl font-bold text-white mb-3">{storeQuestion.title}</h1>
                <div className="text-secondary text-sm mb-4 whitespace-pre-wrap">{formatText(storeQuestion.text)}</div>
                
                 {/* Question Attachments (Gallery) */}
                 {storeQuestion.attachmentUrls && storeQuestion.attachmentUrls.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-4">
                        {storeQuestion.attachmentUrls.map((url, i) => (
                            <img 
                                key={i} 
                                src={url} 
                                className="h-40 w-auto rounded-2xl object-cover border border-white/10 shadow-sm cursor-pointer active:scale-[0.98] transition-transform" 
                                onClick={() => setFullScreenImage(url)} 
                                alt={`attachment-${i}`} 
                            />
                        ))}
                    </div>
                )}

                <button onClick={handleLikeQuestion} className={`flex items-center gap-2 text-sm ${isQuestionLiked ? 'text-primary' : 'text-secondary'}`}>
                    <ThumbsUp size={16} className={isQuestionLiked ? 'fill-current' : ''} />
                    <span className="font-bold">{storeQuestion.likes} {t['q.helpful']}</span>
                </button>
            </div>

            <h3 className="font-bold text-white mb-4">{t['q.answers']} ({currentAnswers.length})</h3>
            <div className="space-y-2">
                {currentAnswers.map(ans => <AnswerItem key={ans.id} answer={ans} />)}
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-[#121212] border-t border-white/5 px-4 py-3 pb-safe z-40">
             <div className="flex items-end gap-3">
                  <div className="flex-1 bg-[#2C2C2E] rounded-[24px] flex items-end px-4 py-2">
                      <textarea 
                          value={mainAnswerText}
                          onChange={(e) => setMainAnswerText(e.target.value)}
                          placeholder={t['q.write_answer']}
                          className="bg-transparent w-full outline-none text-sm text-white resize-none max-h-[120px] py-1"
                          rows={1}
                      />
                      <button onClick={handleSubmitMainAnswer} className="text-primary ml-2"><Send size={20} /></button>
                  </div>
             </div>
        </div>
        
        {fullScreenImage && (
            <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4" onClick={() => setFullScreenImage(null)}>
                <img src={fullScreenImage} className="max-w-full max-h-full" alt="full screen" />
            </div>
        )}
    </div>
  );
};