
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ThumbsUp, Gift, VenetianMask, CheckCircle2, MoreHorizontal, Trash2, Share2, AlertTriangle, X, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import { useStore, MIN_LIKES_FOR_BEST } from '../store';
import { translations } from '../translations';
import { Answer } from '../types';
import { PageHeader } from '../components/PageHeader';
import { ImageViewer } from '../components/ImageViewer';

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
};

const formatDate = (dateString: string, t: any) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const diff = (Date.now() - date.getTime()) / 1000;
        if (diff < 60) return t['time.just_now'] || 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    } catch(e) { return dateString; }
};

export const QuestionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, language, getUserById, getAllUsers, toggleLike, questions, subscribeToAnswers, answers, addAnswer, addReply, markAnswerAsBest, deleteQuestion, deleteAnswer, submitReport, sendTip } = useStore();
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
  const [tipCurrency, setTipCurrency] = useState<'STARS' | 'COINS'>('COINS');
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  const [mainAnswerText, setMainAnswerText] = useState('');
  const [mainAnswerImage, setMainAnswerImage] = useState<string | null>(null);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  
  const [questionMenuOpen, setQuestionMenuOpen] = useState(false);
  
  // Mention logic
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{title: string, text: string, url: string} | null>(null);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<{id: string, type: 'QUESTION' | 'ANSWER'} | null>(null);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDesc, setReportDesc] = useState('');

  if (!storeQuestion) return <div className="p-10 text-white text-center">{t['loading']}</div>;

  const questionAuthor = getUserById(storeQuestion.authorId);
  const isQuestionLiked = currentUser?.likedEntityIds.includes(storeQuestion.id || '');
  const isMyQuestion = currentUser?.id === storeQuestion.authorId;
  const allUsers = getAllUsers();

  // Mentions
  const filteredUsers = mentionQuery 
      ? Object.values(allUsers).filter(u => u.username.includes(mentionQuery) || u.displayName.toLowerCase().includes(mentionQuery))
      : [];

  const handleLikeQuestion = () => toggleLike(storeQuestion.id, 'QUESTION');
  const handleLikeAnswer = (aid: string) => toggleLike(aid, 'ANSWER');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') setMainAnswerImage(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const insertMention = (username: string) => {
      setMainAnswerText(prev => prev.replace(/@\w*$/, `@${username} `));
      setMentionQuery(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setMainAnswerText(val);
      const match = val.match(/@(\w*)$/);
      if (match) setMentionQuery(match[1].toLowerCase());
      else setMentionQuery(null);
      
      // Auto resize
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmitMainAnswer();
      }
  };

  const handleSubmitMainAnswer = async () => {
      if (!mainAnswerText.trim() && !mainAnswerImage) return;
      
      // If replying to a specific answer (nested)
      if (replyingToId) {
          await addReply(storeQuestion.id, replyingToId, mainAnswerText, mainAnswerImage ? [mainAnswerImage] : []);
      } else {
          await addAnswer(storeQuestion.id, mainAnswerText, mainAnswerImage ? [mainAnswerImage] : []);
      }
      
      setMainAnswerText('');
      setMainAnswerImage(null);
      setReplyingToId(null);
  };

  const handleDeleteQuestion = async () => {
      if (window.confirm(t['q.delete_q_confirm'])) {
          await deleteQuestion(storeQuestion.id);
          navigate('/');
      }
  };
  
  const handleOpenReport = (id: string, type: 'QUESTION' | 'ANSWER') => {
      setReportTarget({ id, type });
      setReportModalOpen(true);
  };

  const submitReportAction = async () => {
      if (!reportTarget) return;
      await submitReport(reportTarget.id, reportTarget.type, reportReason, reportDesc);
      setReportModalOpen(false);
      setReportDesc('');
      alert(t['report.success']);
  };

  const handleShare = (title: string, text: string, id: string, isAnswer = false) => {
      const url = `${window.location.origin}/#/question/${storeQuestion.id}${isAnswer ? `?answer=${id}` : ''}`;
      setShareData({ title, text, url });
      setIsShareModalOpen(true);
  };

  const handleTip = async () => {
      if (!tippingAnswerId || !currentUser) return;
      const amount = customTipAmount ? parseInt(customTipAmount) : 10;
      if (isNaN(amount) || amount <= 0) return;
      
      const success = await sendTip(amount, tippingAnswerId, tipCurrency);
      if (success) {
          setTippingAnswerId(null);
          setCustomTipAmount('');
          alert(t['q.success_tip']);
      } else {
          alert(t['q.fail_tip']);
      }
  };

  const AnswerItem: React.FC<{ answer: Answer }> = ({ answer }) => {
      const isLiked = currentUser?.likedEntityIds.includes(answer.id);
      const canMarkBest = isMyQuestion && !storeQuestion.isSolved && answer.likes >= MIN_LIKES_FOR_BEST;
      const [menuOpen, setMenuOpen] = useState(false);
      const [repliesExpanded, setRepliesExpanded] = useState(false);
      const isMe = currentUser?.id === answer.authorId;

      const REPLIES_TO_SHOW = 2;
      const hasHiddenReplies = answer.replies && answer.replies.length > REPLIES_TO_SHOW;
      const visibleReplies = repliesExpanded ? answer.replies : answer.replies?.slice(0, REPLIES_TO_SHOW);

      const handleDelete = async () => {
          if (window.confirm(t['q.delete_confirm'])) {
              await deleteAnswer(storeQuestion.id, answer.id);
          }
      };

      return (
        <div className={`p-4 rounded-3xl border mb-3 bg-card ${answer.isAccepted ? 'border-success/50 bg-success/5' : 'border-white/5'}`}>
             <div className="flex justify-between items-start mb-2 relative">
                <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{answer.authorName}</span>
                    <span className="text-xs text-secondary">• {formatDate(answer.createdAt, t)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                    {answer.isAccepted && (
                        <div className="text-success flex items-center gap-1 text-xs font-bold bg-success/10 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={12} /> {t['q.best_label']}
                        </div>
                    )}
                    <button onClick={() => setMenuOpen(!menuOpen)} className="text-secondary p-1">
                        <MoreHorizontal size={16} />
                    </button>
                    
                    {menuOpen && (
                        <div className="absolute right-0 top-6 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-xl z-10 min-w-[140px] overflow-hidden animate-in fade-in zoom-in-95">
                            {isMe && (
                                <button 
                                    onClick={() => { setMenuOpen(false); handleDelete(); }}
                                    className="w-full text-left px-4 py-3 text-xs font-bold text-danger hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Trash2 size={14} /> {t['q.delete']}
                                </button>
                            )}
                            {!isMe && (
                                <button 
                                    onClick={() => { setMenuOpen(false); handleOpenReport(answer.id, 'ANSWER'); }}
                                    className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2"
                                >
                                    <AlertTriangle size={14} /> {t['q.report']}
                                </button>
                            )}
                            <button 
                                onClick={() => { setMenuOpen(false); handleShare(storeQuestion.title, answer.text, answer.id, true); }}
                                className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2"
                            >
                                <Share2 size={14} /> {t['q.share']}
                            </button>
                        </div>
                    )}
                </div>
             </div>
             
             <div className="text-gray-300 text-sm mb-3 whitespace-pre-wrap leading-relaxed">{formatText(answer.text)}</div>
             
             {answer.attachmentUrls?.map((url, i) => (
                 <img key={i} src={url} className="w-28 h-28 rounded-xl object-cover mb-2 cursor-pointer" onClick={() => setFullScreenImage(url)} alt="attachment" />
             ))}

             <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex gap-4">
                    <button onClick={() => handleLikeAnswer(answer.id)} className={`flex items-center gap-1.5 ${isLiked ? 'text-primary' : 'text-secondary'}`}>
                        <ThumbsUp size={16} className={isLiked ? 'fill-current' : ''} />
                        <span className="font-bold text-xs">{answer.likes || 0}</span>
                    </button>
                    <button 
                        onClick={() => {
                            setReplyingToId(answer.id);
                            setMainAnswerText(`@${answer.authorName} `);
                        }}
                        className="text-secondary text-xs font-bold hover:text-white"
                    >
                        {t['q.reply']}
                    </button>
                </div>
                <div className="flex gap-2">
                    {canMarkBest && (
                        <button 
                            onClick={() => markAnswerAsBest(storeQuestion.id, answer.id)}
                            className="flex items-center gap-1 bg-success/10 hover:bg-success/20 px-3 py-1.5 rounded-full text-xs font-bold text-success transition-colors"
                        >
                            <CheckCircle2 size={14} /> Accept
                        </button>
                    )}
                    {!isMe && (
                        <button onClick={() => setTippingAnswerId(answer.id)} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full text-xs font-bold text-secondary hover:bg-white/10 hover:text-white transition-colors">
                            <Gift size={14} /> {t['q.tip']}
                        </button>
                    )}
                </div>
             </div>

             {/* Nested Replies */}
             {answer.replies && answer.replies.length > 0 && (
                 <div className="mt-3 space-y-0">
                     {visibleReplies?.map((reply: any, idx: number) => (
                         <div key={idx} className="relative pl-6 pt-2">
                             {/* Thread connector line */}
                             <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10"></div>
                             <div className="absolute left-2 top-6 w-4 h-px bg-white/10"></div>
                             
                             <div className="bg-white/5 p-3 rounded-xl relative">
                                 <div className="flex items-center gap-2 mb-1">
                                     <span className="font-bold text-xs text-white">{reply.authorName}</span>
                                     <span className="text-[10px] text-secondary">• {formatDate(reply.createdAt, t)}</span>
                                 </div>
                                 <div className="text-gray-300 text-xs leading-relaxed">{formatText(reply.text)}</div>
                                 {reply.attachmentUrls?.map((url: string, i: number) => (
                                     <img key={i} src={url} className="w-16 h-16 rounded-lg object-cover mt-2 cursor-pointer" onClick={() => setFullScreenImage(url)} alt="reply-attach" />
                                 ))}
                             </div>
                         </div>
                     ))}

                     {hasHiddenReplies && (
                         <div className="relative pl-6 pt-2">
                             <div className="absolute left-2 top-0 h-4 w-px bg-white/10"></div>
                             <div className="absolute left-2 top-4 w-4 h-px bg-white/10 rounded-bl-xl"></div>
                             <button 
                                onClick={() => setRepliesExpanded(!repliesExpanded)}
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg ml-0"
                             >
                                 {repliesExpanded ? (
                                     <>
                                        <ChevronUp size={14} />
                                        {t['q.show_less']}
                                     </>
                                 ) : (
                                     <>
                                        <CornerDownRight size={14} />
                                        {t['q.view_more']} ({answer.replies.length - REPLIES_TO_SHOW})
                                     </>
                                 )}
                             </button>
                         </div>
                     )}
                 </div>
             )}
        </div>
      );
  };

  return (
    <div className="h-screen flex flex-col bg-bg text-white overflow-hidden">
        <PageHeader 
            title={t['q.question']} 
            className="bg-bg/90 backdrop-blur-md"
            rightElement={
                <div className="relative">
                    <button onClick={() => setQuestionMenuOpen(!questionMenuOpen)} className="p-2 text-secondary hover:text-white">
                        <MoreHorizontal size={24} />
                    </button>
                    {questionMenuOpen && (
                        <div className="absolute right-0 top-10 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-xl z-50 min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95">
                            <button 
                                onClick={() => { setQuestionMenuOpen(false); handleShare(storeQuestion.title, storeQuestion.text, storeQuestion.id); }}
                                className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2"
                            >
                                <Share2 size={16} /> {t['q.share']}
                            </button>
                            
                            {isMyQuestion ? (
                                <button 
                                    onClick={() => { setQuestionMenuOpen(false); handleDeleteQuestion(); }}
                                    className="w-full text-left px-4 py-3 text-xs font-bold text-danger hover:bg-white/5 flex items-center gap-2"
                                >
                                    <Trash2 size={16} /> {t['q.delete_q']}
                                </button>
                            ) : (
                                <button 
                                    onClick={() => { setQuestionMenuOpen(false); handleOpenReport(storeQuestion.id, 'QUESTION'); }}
                                    className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 flex items-center gap-2"
                                >
                                    <AlertTriangle size={16} /> {t['q.report']}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            }
        />

        <div className="flex-1 overflow-y-auto px-4 pb-32 no-scrollbar" onClick={() => setQuestionMenuOpen(false)}>
            <div className="bg-card p-5 rounded-3xl shadow-sm border border-white/5 mb-6 relative">
                
                <div className="flex items-center gap-3 mb-4" onClick={() => !storeQuestion.isAnonymous && navigate(`/user/${storeQuestion.authorId}`)}>
                     <div className="w-10 h-10 bg-input rounded-full flex items-center justify-center overflow-hidden border border-white/10">
                         {storeQuestion.isAnonymous ? <VenetianMask size={20}/> : <img src={questionAuthor?.avatarUrl} className="w-full h-full object-cover" alt="avatar" />}
                     </div>
                     <div>
                         <div className="text-sm font-bold text-white flex items-center gap-2">
                             {storeQuestion.isAnonymous ? t['q.anonymous'] : questionAuthor?.displayName}
                             {!storeQuestion.isAnonymous && storeQuestion.authorId === currentUser?.id && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">YOU</span>}
                         </div>
                         <div className="text-xs text-secondary">{formatDate(storeQuestion.createdAt, t)}</div>
                     </div>
                </div>
                
                <h1 className="text-xl font-bold text-white mb-3 leading-tight">{storeQuestion.title}</h1>
                <div className="text-secondary text-sm mb-4 whitespace-pre-wrap leading-relaxed">{formatText(storeQuestion.text)}</div>
                
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

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <button onClick={handleLikeQuestion} className={`flex items-center gap-2 text-sm transition-colors ${isQuestionLiked ? 'text-primary' : 'text-secondary'}`}>
                        <ThumbsUp size={18} className={isQuestionLiked ? 'fill-current' : ''} />
                        <span className="font-bold">{storeQuestion.likes}</span>
                    </button>
                </div>
            </div>

            <h3 className="font-bold text-white mb-4 px-1 flex items-center justify-between">
                <span>{t['q.answers']} ({storeQuestion.answerCount || currentAnswers.length})</span>
            </h3>
            
            <div className="space-y-2">
                {currentAnswers.map(ans => <AnswerItem key={ans.id} answer={ans} />)}
                {currentAnswers.length === 0 && (
                    <div className="text-center py-10 text-secondary text-sm opacity-60">
                        No answers yet. Be the first!
                    </div>
                )}
            </div>
        </div>

        {/* Sticky Input Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/5 px-4 py-3 pb-safe z-40">
             {replyingToId && (
                 <div className="bg-white/5 p-2 rounded-lg mb-2 flex justify-between items-center text-xs">
                     <span className="text-secondary">Replying to comment...</span>
                     <button onClick={() => setReplyingToId(null)}><X size={14} /></button>
                 </div>
             )}
             {mainAnswerImage && (
                 <div className="mb-2 relative inline-block">
                     <img src={mainAnswerImage} className="h-16 rounded-lg border border-white/10" alt="preview" />
                     <button onClick={() => setMainAnswerImage(null)} className="absolute -top-2 -right-2 bg-card text-white rounded-full p-1 border border-white/10">
                         <Trash2 size={12} />
                     </button>
                 </div>
             )}
             
             {mentionQuery !== null && filteredUsers.length > 0 && (
                 <div className="absolute bottom-full left-4 mb-2 bg-card border border-white/10 rounded-xl shadow-xl overflow-hidden w-64 max-h-48 overflow-y-auto">
                     {filteredUsers.map(u => (
                         <button 
                            key={u.id} 
                            onClick={() => insertMention(u.username)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-2"
                         >
                             <img src={u.avatarUrl} className="w-6 h-6 rounded-full" alt="av" />
                             <span className="text-sm font-bold text-white">@{u.username}</span>
                         </button>
                     ))}
                 </div>
             )}

             <div className="flex items-end gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-card border border-white/10 shrink-0">
                      <img src={currentUser?.avatarUrl} className="w-full h-full object-cover" alt="me" />
                  </div>
                  
                  <div className="flex-1 bg-[#2C2C2E] rounded-[20px] flex items-end px-4 py-2 min-h-[44px] border border-transparent focus-within:border-primary transition-colors relative">
                      <textarea 
                          value={mainAnswerText}
                          onChange={handleTextChange}
                          onKeyDown={handleKeyDown}
                          placeholder={t['q.write_answer']}
                          className="bg-transparent w-full outline-none text-sm text-white resize-none py-1 max-h-[120px] no-scrollbar placeholder:text-secondary"
                          rows={1}
                      />
                      <div className="flex items-center gap-2 ml-2 pb-0.5">
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                          <button className="text-secondary hover:text-primary transition-colors" onClick={() => setMainAnswerText(prev => prev + '@')}>@</button>
                          <button className="text-secondary hover:text-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
                              <MoreHorizontal size={20} />
                          </button>
                      </div>
                  </div>
                  
                  <button 
                    onClick={handleSubmitMainAnswer} 
                    disabled={!mainAnswerText.trim() && !mainAnswerImage}
                    className="w-11 h-11 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                      <Send size={20} className="ml-0.5" />
                  </button>
             </div>
        </div>
        
        {/* Fullscreen Image Viewer */}
        {fullScreenImage && <ImageViewer src={fullScreenImage} onClose={() => setFullScreenImage(null)} />}

        {/* Tipping Modal */}
        {tippingAnswerId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setTippingAnswerId(null)}>
                <div className="bg-card w-full max-w-xs rounded-3xl p-6 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-center font-bold text-white text-lg mb-2">{t['q.tip_modal_title']}</h3>
                    <p className="text-center text-secondary text-xs mb-6">{t['q.tip_desc']}</p>
                    
                    <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                        <button onClick={() => setTipCurrency('COINS')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tipCurrency === 'COINS' ? 'bg-primary text-white shadow-sm' : 'text-secondary'}`}>
                            {t['q.tip.coins']}
                        </button>
                        <button onClick={() => setTipCurrency('STARS')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${tipCurrency === 'STARS' ? 'bg-warning text-black shadow-sm' : 'text-secondary'}`}>
                            {t['q.tip.stars']}
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {[10, 50, 100].map(amt => (
                            <button key={amt} onClick={() => setCustomTipAmount(amt.toString())} className="py-3 bg-input hover:bg-white/10 rounded-xl text-sm font-bold text-white border border-white/5 transition-colors">
                                {amt}
                            </button>
                        ))}
                    </div>
                    
                    <input 
                        type="number" 
                        value={customTipAmount}
                        onChange={e => setCustomTipAmount(e.target.value)}
                        placeholder="Custom amount"
                        className="w-full bg-input text-white rounded-xl p-3 text-center font-bold mb-4 border border-transparent focus:border-primary outline-none"
                    />

                    <button onClick={handleTip} className="w-full py-3 bg-white text-black font-bold rounded-xl active:scale-95 transition-transform">
                        Send Gift
                    </button>
                </div>
            </div>
        )}

        {/* Report Modal */}
        {reportModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setReportModalOpen(false)}>
                 <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
                     <h3 className="text-lg font-bold text-white mb-4">{t['report.title']}</h3>
                     <div className="space-y-2 mb-4">
                         {['spam', 'harassment', 'inappropriate', 'fake', 'other'].map(r => (
                             <button 
                                key={r}
                                onClick={() => setReportReason(r)}
                                className={`w-full text-left p-3 rounded-xl text-sm font-medium border transition-all ${reportReason === r ? 'bg-primary/10 border-primary text-primary' : 'bg-input border-transparent text-secondary'}`}
                             >
                                 {t[`report.reason.${r}`]}
                             </button>
                         ))}
                     </div>
                     <textarea 
                        value={reportDesc} 
                        onChange={e => setReportDesc(e.target.value)}
                        placeholder={t['report.desc_placeholder']}
                        className="w-full bg-input rounded-xl p-3 text-sm text-white outline-none border border-transparent focus:border-white/20 mb-4 h-24 resize-none"
                     />
                     <button onClick={submitReportAction} className="w-full py-3 bg-danger text-white font-bold rounded-xl active:scale-95 transition-transform">
                         {t['report.submit']}
                     </button>
                 </div>
            </div>
        )}

        {/* Share Modal */}
        {isShareModalOpen && shareData && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setIsShareModalOpen(false)}>
                <div className="bg-[#1C1C1E] w-full rounded-t-3xl p-6 border-t border-white/10 animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                    <h3 className="text-center font-bold text-white text-lg mb-6">{t['share.title']}</h3>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <button onClick={() => {
                             const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`;
                             window.open(tgUrl, '_blank');
                        }} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl bg-[#0088CC] flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20">
                                <Send size={28} />
                            </div>
                            <span className="text-xs text-secondary font-medium">Telegram</span>
                        </button>
                        <button onClick={() => {
                            navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
                            alert(t['share.copied']);
                            setIsShareModalOpen(false);
                        }} className="flex flex-col items-center gap-2">
                            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white text-2xl">
                                <Share2 size={28} />
                            </div>
                            <span className="text-xs text-secondary font-medium">{t['share.copy']}</span>
                        </button>
                    </div>
                    <button onClick={() => setIsShareModalOpen(false)} className="w-full py-4 bg-input rounded-2xl font-bold text-white text-sm">
                        Cancel
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};