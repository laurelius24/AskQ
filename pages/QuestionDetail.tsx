import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ThumbsUp, CheckCircle2, Zap, Star, X, Share2, MessageCircle, Image as ImageIcon, Gift, MoreHorizontal, AtSign, Trash2, Flag, Coins, VenetianMask, AlertTriangle, Copy } from 'lucide-react';
import { useStore } from '../store';
import { translations } from '../translations';
import { Answer } from '../types';

// Helper to shorten URLs in text
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
            } catch (e) {
                return part;
            }
        }
        return part;
    });
};

// Helper to display date friendly
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // check if valid date
    if (isNaN(date.getTime())) return dateString; // Return original string if it's like "2 hours ago"
    
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
};

export const QuestionDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sendTip, currentUser, language, getUserById, getAllUsers, toggleLike, questions, submitReport } = useStore();
  const t = translations[language];
  
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Local state
  const [tippingAnswerId, setTippingAnswerId] = useState<string | null>(null);
  const [tipCurrency, setTipCurrency] = useState<'STARS' | 'COINS'>('STARS');
  const [customTipAmount, setCustomTipAmount] = useState<string>('');
  
  // Full Screen Image State
  const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);
  
  // State for Main Answer Form
  const [mainAnswerText, setMainAnswerText] = useState('');
  const [mainAnswerImage, setMainAnswerImage] = useState<string | null>(null);

  // State for Inline Replies
  const [replyingToId, setReplyingToId] = useState<string | null>(null); // ID of answer we are replying to
  const [replyText, setReplyText] = useState('');

  // Mention Logic State
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const allUsers = getAllUsers(); // Mock users for mention list

  // Find question in store for real-time likes
  const storeQuestion = questions.find(q => q.id === id);
  
  // Like Animation State
  const [animatingLike, setAnimatingLike] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('spam');
  const [customReportText, setCustomReportText] = useState('');

  // Share Modal State
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<{type: 'QUESTION' | 'ANSWER', id: string, text: string} | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
        // Reset height to auto to correctly calculate new scrollHeight (shrink if text deleted)
        textareaRef.current.style.height = 'auto';
        // Set new height based on content, max 120px
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [mainAnswerText]);

  // Temporary mock data expansion including replies and images
  const [questionData, setQuestionData] = useState({
    id: id,
    text: storeQuestion?.title || "What is the best coworking space in Canggu?", // Use store title if avail
    authorId: storeQuestion?.authorId || "u2",
    authorName: "Sarah",
    createdAt: storeQuestion?.createdAt || "2 hours ago",
    description: storeQuestion?.text || "I need a quiet place with dedicated fiber optic line.",
    attachmentUrls: [] as string[],
    isAnonymous: storeQuestion?.isAnonymous || false,
    answers: [
        { 
            id: 'a1', 
            questionId: id!,
            authorId: 'u2', 
            authorName: 'Sarah', 
            text: "Tropical Nomad is great. Very stable connection.", 
            createdAt: '1h ago',
            likes: 12, 
            starsReceived: 50,
            coinsReceived: 100,
            isAccepted: true,
            attachmentUrls: ['https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=500&q=60'],
            replies: [
                {
                    id: 'r1',
                    questionId: id!,
                    authorId: 'u3', 
                    authorName: 'Mike',
                    text: "Is it crowded?",
                    createdAt: '30m ago',
                    likes: 1,
                    starsReceived: 0,
                    coinsReceived: 0,
                    isAccepted: false
                }
            ]
        },
        { 
            id: 'a2', 
            questionId: id!,
            authorId: 'u3', 
            authorName: 'Mike', 
            text: "B Work is newer and cleaner, but slightly more expensive.", 
            createdAt: '45m ago',
            likes: 5, 
            starsReceived: 0,
            coinsReceived: 0,
            isAccepted: false 
        },
    ] as Answer[]
  });

  const questionAuthor = getUserById(questionData.authorId);
  const isQuestionLiked = currentUser?.likedEntityIds.includes(id || '');

  const handleLikeQuestion = () => {
      if (!id) return;
      setAnimatingLike(true);
      toggleLike(id, 'QUESTION');
      setTimeout(() => setAnimatingLike(false), 300);
  };

  // Filter users for mention
  const filteredUsers = useMemo(() => {
      if (mentionQuery === null) return [];
      const q = mentionQuery.toLowerCase();
      return Object.values(allUsers).filter(u => 
          u.username.toLowerCase().includes(q) || 
          u.displayName.toLowerCase().includes(q)
      );
  }, [mentionQuery, allUsers]);

  // Sort Answers: Accepted First, then new ones
  const sortedAnswers = useMemo(() => {
      return [...questionData.answers].sort((a, b) => {
          if (a.isAccepted) return -1;
          if (b.isAccepted) return 1;
          return 0;
      });
  }, [questionData.answers]);

  const openShareModal = (type: 'QUESTION' | 'ANSWER', entityId: string, text: string) => {
      setShareData({ type, id: entityId, text });
      setShareModalOpen(true);
  };

  const generateShareUrl = () => {
      const baseUrl = window.location.origin + window.location.pathname + '#/question/' + id;
      if (shareData?.type === 'ANSWER') {
          return `${baseUrl}?answer=${shareData.id}`;
      }
      return baseUrl;
  };

  const handleCopyLink = () => {
      const url = generateShareUrl();
      navigator.clipboard.writeText(url);
      alert(t['share.copied']);
      setShareModalOpen(false);
  };

  const handleTelegramShare = () => {
      const url = encodeURIComponent(generateShareUrl());
      const text = encodeURIComponent(shareData?.text || '');
      window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
      setShareModalOpen(false);
  };

  const handleNativeShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: 'GeoAsk',
                  text: shareData?.text,
                  url: generateShareUrl()
              });
          } catch (e) { console.log('Share cancelled'); }
      } else {
          handleCopyLink();
      }
      setShareModalOpen(false);
  };

  const handleTip = (amount?: number) => {
    if (!tippingAnswerId) return;
    
    const finalAmount = amount || parseInt(customTipAmount);
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) return;

    const success = sendTip(finalAmount, tippingAnswerId, tipCurrency);
    if (success) {
        const updatedAnswers = questionData.answers.map(a => {
            if (a.id === tippingAnswerId) {
                return {
                    ...a,
                    starsReceived: tipCurrency === 'STARS' ? a.starsReceived + finalAmount : a.starsReceived,
                    coinsReceived: tipCurrency === 'COINS' ? a.coinsReceived + finalAmount : a.coinsReceived
                };
            }
            if (a.replies) {
                a.replies = a.replies.map(r => {
                    if (r.id === tippingAnswerId) {
                        return {
                            ...r,
                            starsReceived: tipCurrency === 'STARS' ? r.starsReceived + finalAmount : r.starsReceived,
                            coinsReceived: tipCurrency === 'COINS' ? r.coinsReceived + finalAmount : r.coinsReceived
                        }
                    }
                    return r;
                })
            }
            return a;
        });
        setQuestionData({...questionData, answers: updatedAnswers});
        alert(`${t['q.success_tip']} ${finalAmount} ${tipCurrency === 'STARS' ? 'Stars' : 'BLAST'}!`);
        setTippingAnswerId(null);
        setCustomTipAmount('');
    } else {
        alert(t['q.fail_tip']);
    }
  };

  const handleMainFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
             if (typeof reader.result === 'string') setMainAnswerImage(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmitMainAnswer = () => {
      if (!mainAnswerText.trim() && !mainAnswerImage) return;

      const newAnswer: Answer = {
          id: `new_${Date.now()}`,
          questionId: questionData.id!,
          authorId: currentUser?.id || 'me',
          authorName: currentUser?.displayName || 'Me',
          text: mainAnswerText,
          // Use real date for logic
          createdAt: new Date().toISOString(),
          likes: 0,
          starsReceived: 0,
          coinsReceived: 0,
          isAccepted: false,
          attachmentUrls: mainAnswerImage ? [mainAnswerImage] : [],
          replies: []
      };

      setQuestionData({...questionData, answers: [...questionData.answers, newAnswer]});
      setMainAnswerText('');
      setMainAnswerImage(null);
      // Reset height
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          // If mention menu is open, let it handle selection (future improvement), 
          // for now assume Enter submits if we are not selecting a user explicitly.
          handleSubmitMainAnswer();
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setMainAnswerText(val);

      // Simple Mention Logic
      const lastChar = val.slice(-1);
      const words = val.split(/\s+/);
      const lastWord = words[words.length - 1];

      if (lastWord.startsWith('@')) {
          setMentionQuery(lastWord.slice(1));
      } else {
          setMentionQuery(null);
      }
  };

  const insertMention = (username: string) => {
      const words = mainAnswerText.split(/\s+/);
      words.pop(); // remove partial mention
      const newText = [...words, `@${username} `].join(' ');
      setMainAnswerText(newText);
      setMentionQuery(null);
      textareaRef.current?.focus();
  };

  const handleSubmitReply = (parentId: string) => {
      if (!replyText.trim()) return;

      const newReply: Answer = {
          id: `rep_${Date.now()}`,
          questionId: questionData.id!,
          authorId: currentUser?.id || 'me',
          authorName: currentUser?.displayName || 'Me',
          text: replyText,
          createdAt: new Date().toISOString(),
          likes: 0,
          starsReceived: 0,
          coinsReceived: 0,
          isAccepted: false,
          attachmentUrls: [],
          replies: []
      };

      const updatedAnswers = questionData.answers.map(ans => {
          if (ans.id === parentId) {
              return { ...ans, replies: [...(ans.replies || []), newReply] };
          }
          return ans;
      });
      
      setQuestionData({...questionData, answers: updatedAnswers});
      setReplyingToId(null);
      setReplyText('');
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (!window.confirm(t['q.delete_confirm'])) return;

    // Check top level
    const filteredTopLevel = questionData.answers.filter(a => a.id !== answerId);
    
    // Check replies if length matches (meaning it wasn't top level or we need to clean replies)
    // If the answer was removed from top level, we are done. If length is same, check nested.
    let finalAnswers = filteredTopLevel;
    if (filteredTopLevel.length === questionData.answers.length) {
        finalAnswers = questionData.answers.map(a => {
            if (a.replies) {
                return { ...a, replies: a.replies.filter(r => r.id !== answerId) };
            }
            return a;
        });
    }

    setQuestionData({ ...questionData, answers: finalAnswers });
  };

  const handleOpenReportModal = (entityId: string) => {
      setReportingId(entityId);
      setReportReason('spam');
      setCustomReportText('');
      setReportModalOpen(true);
  };

  const handleSubmitReport = () => {
      if (!reportingId) return;
      
      // Determine type based on where we clicked (simplified logic for now, assuming only answers have menu)
      // But question header also has flag.
      const type = reportingId === id ? 'QUESTION' : 'ANSWER';
      
      submitReport(reportingId, type, reportReason, customReportText);
      
      setReportModalOpen(false);
      alert(t['report.success']);
      setReportingId(null);
  };
  
  const handleLikeAnswer = (answerId: string) => {
      if (!currentUser) return;
      
      const isLiked = currentUser.likedEntityIds.includes(answerId);
      const diff = isLiked ? -1 : 1; // Toggle logic

      // 1. Update Global User State (persist like/unlike)
      toggleLike(answerId, 'ANSWER');

      // 2. Update Local UI State (Count)
      // We use a recursive function to find and update the answer or nested reply
      const updateAnswersRecursively = (answers: Answer[]): Answer[] => {
          return answers.map(a => {
              if (a.id === answerId) {
                  return { ...a, likes: a.likes + diff };
              }
              if (a.replies) {
                  return { ...a, replies: updateAnswersRecursively(a.replies) };
              }
              return a;
          });
      };

      setQuestionData(prev => ({
          ...prev,
          answers: updateAnswersRecursively(prev.answers)
      }));
  };

  // --- COMPONENTS ---

  const AnswerItem = ({ answer, isReply = false }: { answer: Answer, isReply?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const MAX_VISIBLE_REPLIES = 2;
    const replies = answer.replies || [];
    const hiddenCount = replies.length - MAX_VISIBLE_REPLIES;

    // Check if current user liked this answer
    const isLiked = currentUser?.likedEntityIds.includes(answer.id);

    // Delete Logic
    const isAuthor = currentUser?.id === answer.authorId;
    // Check if within 5 minutes
    const canDelete = useMemo(() => {
        if (!isAuthor) return false;
        const date = new Date(answer.createdAt);
        if (isNaN(date.getTime())) return false; // "1h ago" mocks cannot be deleted
        const diff = Date.now() - date.getTime();
        return diff < 5 * 60 * 1000; // 5 minutes in ms
    }, [isAuthor, answer.createdAt]);

    return (
      <div className={`p-4 rounded-3xl border mb-3 ${answer.isAccepted ? 'bg-success/5 border-success/20' : 'bg-card border-white/5'} ${isReply ? 'ml-8 border-l-2 border-l-white/10' : ''}`}>
          <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div 
                        className="font-bold text-sm text-white active:text-primary transition-colors"
                        onClick={() => navigate(`/user/${answer.authorId}`)}
                    >
                        {answer.authorName}
                    </div>
                    <span className="text-xs text-secondary">• {formatDate(answer.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {answer.isAccepted && (
                        <div className="flex items-center gap-1 bg-success/20 text-success px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <CheckCircle2 size={12} /> {t['q.best_label']}
                        </div>
                    )}
                    
                    {/* Menu Dropdown */}
                    <div className="relative">
                         <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-1 rounded-full hover:bg-white/10 text-secondary"
                         >
                             <MoreHorizontal size={16} />
                         </button>
                         
                         {isMenuOpen && (
                             <>
                                 <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>
                                 <div className="absolute right-0 top-6 bg-card border border-white/10 rounded-xl shadow-xl z-20 min-w-[160px] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                     <button 
                                         onClick={() => { 
                                             openShareModal('ANSWER', answer.id, answer.text);
                                             setIsMenuOpen(false); 
                                         }}
                                         className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left text-xs font-bold text-white"
                                     >
                                         <Share2 size={14} /> {t['q.share_answer']}
                                     </button>
                                     
                                     {!isAuthor && (
                                         <button 
                                             onClick={() => { handleOpenReportModal(answer.id); setIsMenuOpen(false); }}
                                             className="w-full flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left text-xs font-bold text-white border-t border-white/5"
                                         >
                                             <Flag size={14} /> {t['q.report']}
                                         </button>
                                     )}
                                     
                                     {canDelete && (
                                         <button 
                                             onClick={() => { handleDeleteAnswer(answer.id); setIsMenuOpen(false); }}
                                             className="w-full flex items-center gap-2 px-4 py-3 hover:bg-danger/10 text-left text-xs font-bold text-danger border-t border-white/5"
                                         >
                                             <Trash2 size={14} /> {t['q.delete']}
                                         </button>
                                     )}
                                 </div>
                             </>
                         )}
                    </div>
                </div>
          </div>
          
          <div className="text-gray-300 text-sm mb-3 whitespace-pre-wrap leading-relaxed">
                {formatText(answer.text)}
          </div>

          {answer.attachmentUrls && answer.attachmentUrls.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
                  {answer.attachmentUrls.map((url, i) => (
                      <div 
                        key={i} 
                        className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-white/10 cursor-zoom-in active:scale-95 transition-transform"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFullScreenImage(url);
                        }}
                      >
                          <img src={url} alt="attachment" className="w-full h-full object-cover" />
                      </div>
                  ))}
              </div>
          )}
          
          <div className="flex items-center justify-between mt-2">
                <div className="flex gap-3">
                    <button 
                        onClick={() => {
                            setIsLiking(true);
                            handleLikeAnswer(answer.id);
                            setTimeout(() => setIsLiking(false), 300);
                        }}
                        className={`flex items-center gap-1.5 transition-colors ${isLiked ? 'text-primary' : 'text-secondary active:text-primary'}`}
                    >
                        <ThumbsUp size={16} className={`${isLiking ? 'animate-like' : ''} ${isLiked ? 'fill-current' : ''}`} /> 
                        <span className="font-bold text-xs">{answer.likes}</span>
                    </button>

                    {!isReply && (
                        <button 
                            onClick={() => {
                                setReplyingToId(replyingToId === answer.id ? null : answer.id);
                                setReplyText('');
                            }}
                            className={`flex items-center gap-1.5 transition-colors ${replyingToId === answer.id ? 'text-primary' : 'text-secondary active:text-primary'}`}
                        >
                            <MessageCircle size={16} />
                            <span className="font-bold text-xs">{t['q.reply']}</span>
                        </button>
                    )}
                </div>

                <button 
                    onClick={() => setTippingAnswerId(answer.id)}
                    className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 active:bg-white/10 transition-all"
                >
                    <Gift size={14} className="text-secondary" />
                    {(answer.starsReceived > 0 || answer.coinsReceived > 0) ? (
                        <div className="flex items-center gap-2">
                             {answer.starsReceived > 0 && (
                                 <span className="flex items-center gap-0.5 text-xs font-bold text-warning">
                                     <Star size={10} fill="currentColor" /> {answer.starsReceived}
                                 </span>
                             )}
                             {answer.coinsReceived > 0 && (
                                 <span className="flex items-center gap-0.5 text-xs font-bold text-primary">
                                     <div className="w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                                        <Zap size={8} className="text-white fill-white" />
                                     </div>
                                     {answer.coinsReceived}
                                 </span>
                             )}
                        </div>
                    ) : (
                        <span className="text-[10px] font-bold text-secondary">Gift</span>
                    )}
                </button>
            </div>

            {/* INLINE REPLY INPUT */}
            {replyingToId === answer.id && !isReply && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input 
                        type="text" 
                        autoFocus
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 bg-input rounded-xl px-3 py-2 text-sm text-white outline-none border border-transparent focus:border-primary"
                    />
                    <button 
                        onClick={() => handleSubmitReply(answer.id)}
                        disabled={!replyText.trim()}
                        className="bg-primary text-white p-2 rounded-xl disabled:opacity-50"
                    >
                        <Send size={16} />
                    </button>
                </div>
            )}

            {/* NESTED REPLIES */}
            {!isReply && replies.length > 0 && (
                <div className="mt-4 border-t border-white/5 pt-3 relative ml-2">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5"></div>
                    
                    {replies.slice(0, isExpanded ? replies.length : MAX_VISIBLE_REPLIES).map(reply => (
                        <AnswerItem key={reply.id} answer={reply} isReply={true} />
                    ))}

                    {hiddenCount > 0 && !isExpanded && (
                         <button 
                            onClick={() => setIsExpanded(true)}
                            className="ml-6 text-xs font-bold text-primary hover:underline mt-2"
                        >
                             View {hiddenCount} more replies
                         </button>
                    )}
                    {replies.length > MAX_VISIBLE_REPLIES && isExpanded && (
                        <button 
                            onClick={() => setIsExpanded(false)}
                            className="ml-6 text-xs font-bold text-secondary hover:underline mt-2"
                        >
                             Show less
                        </button>
                    )}
                </div>
            )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-bg text-white page-transition overflow-hidden">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between mb-2 p-4 bg-bg/90 backdrop-blur-md border-b border-white/5 z-20">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 active:bg-white/10 rounded-full -ml-2">
                <ArrowLeft size={24} className="text-white" />
            </button>
            <span className="font-bold text-lg">{t['q.question']}</span>
        </div>
        <div className="flex gap-2">
            <button onClick={() => openShareModal('QUESTION', id!, questionData.text)} className="p-2 active:bg-white/10 rounded-full">
                <Share2 size={20} className="text-white" />
            </button>
             <button 
                onClick={() => handleOpenReportModal(id!)}
                className="p-2 active:bg-white/10 rounded-full"
             >
                <Flag size={20} className="text-white" />
            </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
        
        {/* 1. QUESTION CARD */}
        <div className="bg-card p-5 rounded-3xl shadow-sm border border-white/5 mb-6">
            <div 
                className={`flex items-center gap-3 mb-4 ${questionData.isAnonymous ? '' : 'cursor-pointer'}`}
                onClick={() => !questionData.isAnonymous && navigate(`/user/${questionData.authorId}`)}
            >
                <div className="w-10 h-10 bg-input rounded-full overflow-hidden flex items-center justify-center">
                    {questionData.isAnonymous ? (
                        <div className="bg-white/10 w-full h-full flex items-center justify-center">
                             <VenetianMask size={20} className="text-secondary"/> 
                        </div>
                    ) : (
                        questionAuthor && <img src={questionAuthor.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    )}
                </div>
                <div>
                    <div className={`text-sm font-bold text-white ${!questionData.isAnonymous ? 'active:text-primary transition-colors' : ''}`}>
                        {questionData.isAnonymous ? t['q.anonymous'] : (questionAuthor ? questionAuthor.displayName : questionData.authorName)}
                    </div>
                    <div className="text-xs text-secondary">{questionData.createdAt}</div>
                </div>
            </div>
            <h1 className="text-xl font-bold text-white mb-3 leading-snug">{questionData.text}</h1>
            
            <div className="text-secondary leading-relaxed mb-4 whitespace-pre-wrap text-sm">
                {formatText(questionData.description)}
            </div>
            
            <div className="flex gap-2 border-t border-white/5 pt-3">
                <button 
                    onClick={handleLikeQuestion}
                    className={`flex items-center gap-2 text-sm transition-colors ${isQuestionLiked ? 'text-primary' : 'text-secondary active:text-primary'}`}
                >
                    <ThumbsUp size={16} className={isQuestionLiked || animatingLike ? 'fill-current animate-like' : ''} /> 
                    <span className="font-bold">{storeQuestion ? storeQuestion.likes : 24} {t['q.helpful']}</span>
                </button>
            </div>
        </div>

        {/* 2. ANSWERS LIST */}
        <h3 className="font-bold text-white mb-4 flex items-center justify-between">
            <span>{t['q.answers']} <span className="text-secondary text-sm font-normal">({questionData.answers.length})</span></span>
        </h3>

        <div className="space-y-2">
            {sortedAnswers.map(ans => (
                <div key={ans.id}>
                    {ans.isAccepted && <div className="text-xs font-bold text-success mb-2 ml-1 uppercase tracking-wider">{t['q.best_answer']}</div>}
                    <AnswerItem answer={ans} />
                    {ans.isAccepted && sortedAnswers.length > 1 && <div className="h-px bg-white/10 my-6 mx-4"></div>}
                </div>
            ))}
        </div>
      </div>

      {/* 3. STICKY INPUT BAR (Refactored Style) */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#121212] border-t border-white/5 px-4 py-3 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
           {/* (Content remains same as before) */}
           {mentionQuery !== null && filteredUsers.length > 0 && (
               <div className="absolute bottom-full left-4 right-4 mb-2 bg-card rounded-2xl border border-white/10 shadow-xl overflow-hidden max-h-48 overflow-y-auto animate-in slide-in-from-bottom-2">
                   {filteredUsers.map(user => (
                       <button 
                            key={user.id}
                            onClick={() => insertMention(user.username)}
                            className="w-full flex items-center gap-3 p-3 hover:bg-white/5 text-left transition-colors border-b border-white/5 last:border-0"
                       >
                           <img src={user.avatarUrl} className="w-8 h-8 rounded-full" alt={user.username} />
                           <div>
                               <div className="text-sm font-bold text-white">{user.displayName}</div>
                               <div className="text-xs text-secondary">@{user.username}</div>
                           </div>
                       </button>
                   ))}
               </div>
           )}

           {/* Image Preview if selected */}
           {mainAnswerImage && (
               <div className="absolute -top-16 left-4 bg-card p-2 rounded-xl border border-white/10 shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
                    <img src={mainAnswerImage} className="w-10 h-10 object-cover rounded-lg" alt="preview" />
                    <button onClick={() => setMainAnswerImage(null)} className="bg-black/50 p-1 rounded-full text-white">
                        <X size={12} />
                    </button>
               </div>
           )}

           <div className="flex items-end gap-3">
              {/* User Avatar */}
              <div className="w-8 h-8 rounded-full overflow-hidden bg-input shrink-0 border border-white/10 mb-1">
                   {currentUser && <img src={currentUser.avatarUrl} className="w-full h-full object-cover" alt="me" />}
              </div>

              {/* Input Wrapper */}
              <div className="flex-1 bg-[#2C2C2E] rounded-[24px] min-h-[40px] flex items-end px-4 py-2 relative transition-colors focus-within:bg-[#3a3a3c]">
                  <textarea
                      ref={textareaRef}
                      value={mainAnswerText}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      rows={1}
                      placeholder="Write a comment..." 
                      className="bg-transparent w-full outline-none text-sm text-white placeholder:text-secondary/70 resize-none overflow-y-auto max-h-[120px] py-1" 
                  />

                  {/* Right Icons inside input */}
                  <div className="flex items-center gap-3 text-secondary pl-2 pb-1 shrink-0">
                      <button onClick={() => {
                          setMainAnswerText(prev => prev + '@');
                          setMentionQuery('');
                          textareaRef.current?.focus();
                      }} className="hover:text-white transition-colors"><AtSign size={20} strokeWidth={1.5} /></button>
                      
                      <button onClick={() => mainFileInputRef.current?.click()} className="hover:text-white transition-colors">
                          <ImageIcon size={20} strokeWidth={1.5} />
                      </button>
                      
                      {/* Show Send button only if there is content */}
                      {(mainAnswerText.trim() || mainAnswerImage) && (
                           <button onClick={handleSubmitMainAnswer} className="text-primary animate-in fade-in zoom-in">
                               <Send size={20} fill="currentColor" />
                           </button>
                      )}
                  </div>
                  <input type="file" ref={mainFileInputRef} onChange={handleMainFileSelect} className="hidden" accept="image/*" />
              </div>
           </div>
      </div>

      {/* FULL SCREEN IMAGE VIEWER (LIGHTBOX) */}
      {fullScreenImage && (
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center animate-in fade-in duration-200 cursor-zoom-out"
            onClick={() => setFullScreenImage(null)}
          >
              <button className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white active:bg-white/20 z-50">
                  <X size={24} />
              </button>
              <img 
                src={fullScreenImage} 
                alt="Full screen" 
                className="max-w-full max-h-full object-contain p-2" 
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
              />
          </div>
      )}
      
      {/* SHARE MODAL */}
      {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setShareModalOpen(false)}>
              <div className="bg-card w-full rounded-t-3xl p-6 pb-safe border-t border-white/10 animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white">{t['share.title']}</h3>
                      <button onClick={() => setShareModalOpen(false)} className="p-1 bg-white/10 rounded-full text-white">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                      <button onClick={handleTelegramShare} className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-[#0088CC] flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform">
                              <Send size={28} className="-ml-1 mt-1" />
                          </div>
                          <span className="text-xs font-medium text-white">{t['share.telegram']}</span>
                      </button>
                      
                      <button onClick={handleCopyLink} className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-input flex items-center justify-center text-white border border-white/10 shadow-sm active:scale-95 transition-transform">
                              <Copy size={24} />
                          </div>
                          <span className="text-xs font-medium text-white">{t['share.copy']}</span>
                      </button>

                      <button onClick={handleNativeShare} className="flex flex-col items-center gap-2">
                          <div className="w-14 h-14 rounded-2xl bg-input flex items-center justify-center text-white border border-white/10 shadow-sm active:scale-95 transition-transform">
                              <MoreHorizontal size={24} />
                          </div>
                          <span className="text-xs font-medium text-white">{t['share.more']}</span>
                      </button>
                  </div>
                  
                  <div className="mt-6 bg-input p-3 rounded-xl flex items-center justify-between text-xs text-secondary border border-white/5">
                      <span className="truncate flex-1 mr-4">{generateShareUrl()}</span>
                      <button onClick={handleCopyLink} className="font-bold text-primary">Copy</button>
                  </div>
              </div>
          </div>
      )}

      {/* Tipping Modal */}
      {tippingAnswerId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="bg-card w-full rounded-t-3xl p-6 pb-safe border-t border-white/10">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                        <Gift className="text-primary" /> 
                        {t['q.tip_modal_title']}
                    </h3>
                    <button onClick={() => setTippingAnswerId(null)} className="p-1 bg-white/10 rounded-full text-white">
                        <X size={20} />
                    </button>
                </div>
                
                <p className="text-sm text-secondary mb-6">
                    {t['q.tip_desc']}
                </p>

                <div className="flex bg-input p-1 rounded-2xl mb-6">
                    <button 
                        onClick={() => setTipCurrency('STARS')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipCurrency === 'STARS' ? 'bg-card shadow-sm text-white' : 'text-secondary'}`}
                    >
                        <Star size={16} className={tipCurrency === 'STARS' ? 'fill-warning text-warning' : ''} />
                        {t['q.tip.stars']}
                    </button>
                    <button 
                        onClick={() => setTipCurrency('COINS')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${tipCurrency === 'COINS' ? 'bg-card shadow-sm text-white' : 'text-secondary'}`}
                    >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${tipCurrency === 'COINS' ? 'bg-primary' : 'bg-secondary'}`}>
                             <Zap size={10} className="text-white fill-white" />
                        </div>
                        {t['q.tip.coins']}
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[10, 50, 100].map(amount => (
                         <button 
                            key={amount}
                            onClick={() => handleTip(amount)}
                            className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-input active:bg-white/10 active:scale-95 transition-all"
                        >
                            {tipCurrency === 'STARS' ? (
                                <Star size={24} className="text-warning fill-warning" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                    <Zap size={16} className="text-white fill-white" />
                                </div>
                            )}
                            <span className="font-bold text-white">{amount}</span>
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-3 mb-4">
                    <input
                        type="number"
                        value={customTipAmount}
                        onChange={(e) => setCustomTipAmount(e.target.value)}
                        placeholder="Custom amount"
                        className="flex-1 bg-input rounded-xl px-4 outline-none text-white text-sm border border-white/10 focus:border-primary"
                    />
                    <button 
                        onClick={() => handleTip()}
                        disabled={!customTipAmount}
                        className="bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
                    >
                        Send
                    </button>
                </div>

                <div className="text-center text-xs text-secondary">
                    {t['q.balance']}: {tipCurrency === 'STARS' ? `${currentUser?.starsBalance} Stars` : `${currentUser?.walletBalance} BLAST`}
                </div>
            </div>
        </div>
      )}

      {/* REPORT MODAL */}
      {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-card w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <AlertTriangle className="text-warning" size={20} />
                          {t['report.title']}
                      </h3>
                      <button onClick={() => setReportModalOpen(false)} className="p-1 bg-white/10 rounded-full text-white">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-3 mb-4">
                      {['spam', 'harassment', 'inappropriate', 'fake', 'other'].map((reason) => (
                          <label 
                              key={reason} 
                              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                  reportReason === reason 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'bg-input border-transparent hover:bg-white/5'
                              }`}
                          >
                              <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${reportReason === reason ? 'border-primary' : 'border-secondary'}`}>
                                      {reportReason === reason && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                  </div>
                                  <span className="text-sm font-medium text-white">{t[`report.reason.${reason}`]}</span>
                              </div>
                              <input 
                                  type="radio" 
                                  name="reportReason" 
                                  value={reason} 
                                  checked={reportReason === reason}
                                  onChange={() => setReportReason(reason)}
                                  className="hidden"
                              />
                          </label>
                      ))}
                  </div>

                  {reportReason === 'other' && (
                      <textarea
                          value={customReportText}
                          onChange={(e) => setCustomReportText(e.target.value)}
                          placeholder={t['report.desc_placeholder']}
                          className="w-full bg-input rounded-2xl p-4 text-sm text-white outline-none border border-white/10 focus:border-primary min-h-[100px] mb-4 resize-none"
                      />
                  )}

                  <button 
                      onClick={handleSubmitReport}
                      className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-glow active:scale-[0.98] transition-transform"
                  >
                      {t['report.submit']}
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};