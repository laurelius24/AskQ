import { create } from 'zustand';
import { AppState, LocationContext, User, UserRole, LocationType, Coupon, Language, Question, Category, Task, Answer, QuestionDraft, Report, TelegramUser } from './types';
import { db } from './services/firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, doc, 
  updateDoc, arrayUnion, arrayRemove, setDoc, getDoc, 
  where, increment, deleteDoc, getDocs
} from 'firebase/firestore';

// --- CONSTANTS & STATIC DATA ---
export const QUESTION_COST = 50;

export const MOCK_CATEGORIES: Category[] = [
  { id: 'visa', name: 'cat.visa', icon: 'visa' },
  { id: 'money', name: 'cat.money', icon: 'money' },
  { id: 'leisure', name: 'cat.leisure', icon: 'leisure' },
  { id: 'food', name: 'cat.food', icon: 'food' },
  { id: 'animals', name: 'cat.animals', icon: 'animals' },
  { id: 'housing', name: 'cat.housing', icon: 'housing' },
  { id: 'law', name: 'cat.law', icon: 'law' },
  { id: 'health', name: 'cat.health', icon: 'health' },
  { id: 'internet', name: 'cat.internet', icon: 'internet' },
  { id: 'beauty', name: 'cat.beauty', icon: 'beauty' },
  { id: 'culture', name: 'cat.culture', icon: 'culture' },
  { id: 'courses', name: 'cat.courses', icon: 'courses' },
  { id: 'nostrification', name: 'cat.nostrification', icon: 'nostrification' },
  { id: 'education', name: 'cat.education', icon: 'education' },
  { id: 'society', name: 'cat.society', icon: 'society' },
  { id: 'reviews', name: 'cat.reviews', icon: 'reviews' },
  { id: 'shopping', name: 'cat.shopping', icon: 'shopping' },
  { id: 'help', name: 'cat.help', icon: 'help' },
  { id: 'travel', name: 'cat.travel', icon: 'travel' },
  { id: 'job', name: 'cat.job', icon: 'job' },
  { id: 'family', name: 'cat.family', icon: 'family' },
  { id: 'sport', name: 'cat.sport', icon: 'sport' },
  { id: 'transport', name: 'cat.transport', icon: 'transport' },
  { id: 'services', name: 'cat.services', icon: 'services' },
  { id: 'humor', name: 'cat.humor', icon: 'humor' },
  { id: 'language', name: 'cat.language', icon: 'language' },
  { id: 'events', name: 'cat.events', icon: 'events' },
  { id: 'other', name: 'cat.other', icon: 'other' },
].sort((a, b) => a.name.localeCompare(b.name));

// Move 'other' to end
const otherIndex = MOCK_CATEGORIES.findIndex(c => c.id === 'other');
if (otherIndex > -1) {
    const other = MOCK_CATEGORIES.splice(otherIndex, 1)[0];
    MOCK_CATEGORIES.push(other);
}

// Static Locations
const MOCK_LOCATIONS: LocationContext[] = [
    { id: 'cz', name: 'Чехия', type: LocationType.COUNTRY, flagEmoji: '🇨🇿', phoneCode: '420' },
    { id: 'cz_prg', name: 'Прага', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_brn', name: 'Брно', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_plz', name: 'Пльзень', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_ost', name: 'Острава', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_lib', name: 'Либерец', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_olo', name: 'Оломоуц', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_cb', name: 'Ческе-Будеёвице', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_hk', name: 'Градец-Кралове', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_ul', name: 'Усти-над-Лабем', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_par', name: 'Пардубице', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'cz_kv', name: 'Карловы Вары', type: LocationType.CITY, flagEmoji: '', parentId: 'cz' },
    { id: 'ru', name: 'Россия', type: LocationType.COUNTRY, flagEmoji: '🇷🇺', phoneCode: '7' },
    { id: 'ua', name: 'Украина', type: LocationType.COUNTRY, flagEmoji: '🇺🇦', phoneCode: '380' },
    { id: 'kz', name: 'Казахстан', type: LocationType.COUNTRY, flagEmoji: '🇰🇿', phoneCode: '7' },
    { id: 'by', name: 'Беларусь', type: LocationType.COUNTRY, flagEmoji: '🇧🇾', phoneCode: '375' },
    { id: 'us', name: 'США', type: LocationType.COUNTRY, flagEmoji: '🇺🇸', phoneCode: '1' },
    { id: 'de', name: 'Германия', type: LocationType.COUNTRY, flagEmoji: '🇩🇪', phoneCode: '49' },
    { id: 'pl', name: 'Польша', type: LocationType.COUNTRY, flagEmoji: '🇵🇱', phoneCode: '48' },
    { id: 'fr', name: 'Франция', type: LocationType.COUNTRY, flagEmoji: '🇫🇷', phoneCode: '33' },
    { id: 'it', name: 'Италия', type: LocationType.COUNTRY, flagEmoji: '🇮🇹', phoneCode: '39' },
    { id: 'es', name: 'Испания', type: LocationType.COUNTRY, flagEmoji: '🇪🇸', phoneCode: '34' },
    { id: 'gb', name: 'Великобритания', type: LocationType.COUNTRY, flagEmoji: '🇬🇧', phoneCode: '44' },
    { id: 'tr', name: 'Турция', type: LocationType.COUNTRY, flagEmoji: '🇹🇷', phoneCode: '90' },
    { id: 'th', name: 'Таиланд', type: LocationType.COUNTRY, flagEmoji: '🇹🇭', phoneCode: '66' },
    { id: 'ae', name: 'ОАЭ', type: LocationType.COUNTRY, flagEmoji: '🇦🇪', phoneCode: '971' },
    { id: 'ge', name: 'Грузия', type: LocationType.COUNTRY, flagEmoji: '🇬🇪', phoneCode: '995' },
    { id: 'am', name: 'Армения', type: LocationType.COUNTRY, flagEmoji: '🇦🇲', phoneCode: '374' },
    { id: 'rs', name: 'Сербия', type: LocationType.COUNTRY, flagEmoji: '🇷🇸', phoneCode: '381' },
].sort((a, b) => {
    if (a.id.startsWith('cz') && !b.id.startsWith('cz')) return -1;
    if (!a.id.startsWith('cz') && b.id.startsWith('cz')) return 1;
    return a.name.localeCompare(b.name);
});

const MOCK_COUPONS: Coupon[] = [
    { id: 'c1', title: '10% скидка в Alza', description: 'Скидка на всю электронику.', cost: 100, imageUrl: 'https://cdn.alza.cz/foto/f16/EO/EO180p1.jpg', partnerName: 'Alza.cz', promoCode: 'ASKQ-ALZA-10', expiresAt: '2025-12-31' },
    { id: 'c2', title: 'Бесплатный кофе', description: 'Один капучино при заказе десерта.', cost: 50, imageUrl: 'https://stories.starbucks.com/uploads/2021/09/Starbucks-100-percent-ethically-sourced-coffee-feature.jpg', partnerName: 'Starbucks', promoCode: 'FREE-COFFEE-24', expiresAt: '2025-06-30' },
    { id: 'c3', title: 'Билет в кино 1+1', description: 'Купи один билет, получи второй бесплатно.', cost: 200, imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba', partnerName: 'CinemaCity', promoCode: 'MOVIE-NIGHT', expiresAt: '2025-09-15' },
];

const MOCK_TASKS: Task[] = [
    { id: 't1', title: 'task.daily', reward: 2000, icon: 'calendar', isCompleted: false, type: 'DAILY' },
    { id: 't2', title: 'task.share', reward: 1000, icon: 'share', isCompleted: false, type: 'ONE_TIME' },
    { id: 't3', title: 'task.profile', reward: 500, icon: 'user', isCompleted: true, type: 'ONE_TIME' },
];

// --- HELPER: Sanitize Firestore Data ---
const sanitizeData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  const sanitized: any = {};
  for (const key in data) {
    sanitized[key] = sanitizeData(data[key]);
  }
  return sanitized;
};

// --- STORE INTERFACE ---
interface Store extends AppState {
  savedScrollPositions: Record<string, number>;
  questions: Question[];
  answers: Record<string, Answer[]>;
  categories: Category[];
  availableLocations: LocationContext[];
  availableCoupons: Coupon[];
  tasks: Task[];
  usersMap: Record<string, User>; 
  
  initializeListeners: () => void;
  subscribeToAnswers: (questionId: string) => () => void;

  setLocation: (location: LocationContext) => void;
  setLanguage: (lang: Language) => void;
  setUser: (user: User) => void;
  
  registerUser: (name: string, username: string, avatarUrl: string, bio?: string, websiteUrl?: string) => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  getUserById: (id: string) => User | undefined;
  getAllUsers: () => Record<string, User>;
  
  buyCoupon: (couponId: string) => boolean; 
  sendTip: (amount: number, answerId: string, currency: 'STARS' | 'COINS') => Promise<boolean>;
  claimTaskReward: (taskId: string) => void;
  
  addQuestion: (data: { title: string, text: string, categoryId: string, locationId: string, isAnonymous: boolean, attachments: string[], backgroundStyle?: string }) => boolean;
  addAnswer: (questionId: string, text: string, attachmentUrls: string[]) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  toggleLike: (entityId: string, type: 'QUESTION' | 'ANSWER') => Promise<void>;
  
  saveScrollPosition: (path: string, position: number) => void;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;

  updateQuestionDraft: (draft: Partial<QuestionDraft>) => void;
  clearQuestionDraft: () => void;

  submitReport: (entityId: string, entityType: 'QUESTION' | 'ANSWER', reason: string, description: string) => Promise<void>;
  resolveReport: (reportId: string, action: 'DISMISS' | 'DELETE' | 'BAN_24H' | 'BAN_FOREVER') => Promise<void>;
}

export const useStore = create<Store>((set, get) => ({
  currentUser: null, 
  selectedLocation: null,
  savedScrollPositions: {},
  language: 'ru',
  isLoading: true, 
  questions: [],
  answers: {},
  categories: MOCK_CATEGORIES,
  availableLocations: MOCK_LOCATIONS,
  availableCoupons: MOCK_COUPONS,
  tasks: MOCK_TASKS,
  reports: [],
  usersMap: {},
  telegramUser: null,
  
  questionDraft: {
      title: '',
      text: '',
      categoryId: '',
      locationId: '',
      isAnonymous: false,
      attachments: []
  },

  initializeListeners: () => {
      // 1. Initialize Telegram SDK
      const tg = window.Telegram?.WebApp;
      if (tg) {
          tg.ready();
          tg.expand();
          tg.setHeaderColor('#000000');
          tg.setBackgroundColor('#000000');
          
          if (tg.initDataUnsafe?.user) {
              set({ telegramUser: tg.initDataUnsafe.user });
          }
      }

      // If Firebase is not configured, we can't do much
      if (!db) {
          console.warn("Firestore DB not found. Check configuration.");
          set({ isLoading: false });
          return;
      }

      // 2. Setup Real-time Listeners
      // QUESTIONS
      const qQuery = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
      const unsubQuestions = onSnapshot(qQuery, (snapshot) => {
          const questions = snapshot.docs.map(d => ({ id: d.id, ...sanitizeData(d.data()) } as Question));
          set({ questions });
      });

      // USERS (Caching map for fast lookup)
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          const usersMap: Record<string, User> = {};
          snapshot.forEach(doc => {
              usersMap[doc.id] = { id: doc.id, ...sanitizeData(doc.data()) } as User;
          });
          // Also update current user if their doc changed
          const current = get().currentUser;
          if (current && usersMap[current.id]) {
              set({ currentUser: usersMap[current.id] });
          }
          set({ usersMap });
      });

      // REPORTS
      const rQuery = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
      const unsubReports = onSnapshot(rQuery, (snapshot) => {
          const reports = snapshot.docs.map(d => ({ id: d.id, ...sanitizeData(d.data()) } as Report));
          set({ reports });
      });

      // 3. Authenticate User (Telegram > LocalStorage)
      const authenticate = async () => {
          const { telegramUser } = get();
          let userFound = null;

          if (telegramUser) {
              // Strategy A: Check by Telegram ID
              const q = query(collection(db, 'users'), where('telegramId', '==', telegramUser.id));
              const querySnapshot = await getDocs(q);
              
              if (!querySnapshot.empty) {
                  const docSnap = querySnapshot.docs[0];
                  userFound = { id: docSnap.id, ...sanitizeData(docSnap.data()) } as User;
                  
                  // Sync telegram data if changed
                  if (userFound.displayName !== telegramUser.first_name || userFound.username !== telegramUser.username) {
                      updateDoc(docSnap.ref, {
                          displayName: telegramUser.first_name || userFound.displayName,
                          username: telegramUser.username || userFound.username
                      });
                  }
              }
          } 

          // Strategy B: LocalStorage Fallback (if no TG or TG user not registered yet but saved locally)
          if (!userFound) {
              const storedId = localStorage.getItem('askq_userid');
              if (storedId) {
                  const docSnap = await getDoc(doc(db, 'users', storedId));
                  if (docSnap.exists()) {
                      userFound = { id: docSnap.id, ...sanitizeData(docSnap.data()) } as User;
                  }
              }
          }

          if (userFound) {
              set({ currentUser: userFound });
              if (userFound.currentLocationId) {
                   const loc = MOCK_LOCATIONS.find(l => l.id === userFound.currentLocationId);
                   if (loc) set({ selectedLocation: loc });
              }
          }

          set({ isLoading: false });
      };

      authenticate();
      
      return () => {
          unsubQuestions();
          unsubUsers();
          unsubReports();
      };
  },

  subscribeToAnswers: (questionId: string) => {
      if (!db) return () => {};
      const qRef = collection(db, 'questions', questionId, 'answers');
      const qQuery = query(qRef, orderBy('createdAt', 'asc'));
      
      const unsubscribe = onSnapshot(qQuery, (snapshot) => {
          const answers = snapshot.docs.map(d => ({ id: d.id, ...sanitizeData(d.data()) } as Answer));
          set(state => ({
              answers: { ...state.answers, [questionId]: answers }
          }));
      });
      return unsubscribe;
  },

  setLocation: (location) => {
    set({ selectedLocation: location });
    const { currentUser } = get();
    if (currentUser && db) {
        updateDoc(doc(db, 'users', currentUser.id), { currentLocationId: location.id });
    }
  },

  setLanguage: (lang) => {
    set({ language: lang });
    const { currentUser } = get();
    if (currentUser && db) {
         updateDoc(doc(db, 'users', currentUser.id), { language: lang });
    }
  },

  saveScrollPosition: (path, position) => {
    set((state) => ({
        savedScrollPositions: { ...state.savedScrollPositions, [path]: position }
    }));
  },
  
  setUser: (user) => set({ currentUser: user }),
  
  registerUser: async (name, username, avatarUrl, bio = '', websiteUrl = '') => {
    if (!db) return;
    const { language, telegramUser } = get();
    
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

    const newUser = {
        username: cleanUsername,
        displayName: name,
        role: UserRole.USER, 
        reputationScore: 0,
        walletBalance: 100, 
        starsBalance: 0, 
        avatarUrl: avatarUrl,
        bio,
        websiteUrl,
        inventory: [],
        language,
        likedEntityIds: [],
        telegramId: telegramUser?.id || null
    };
    
    try {
        const docRef = await addDoc(collection(db, 'users'), newUser);
        const userWithId = { ...newUser, id: docRef.id } as unknown as User;
        
        set({ currentUser: userWithId });
        localStorage.setItem('askq_userid', docRef.id);
    } catch (e) {
        console.error("Error registering user:", e);
    }
  },

  updateUserProfile: async (updates) => {
      const { currentUser } = get();
      if (!currentUser || !db) return;
      await updateDoc(doc(db, 'users', currentUser.id), updates);
  },

  getUserById: (id) => get().usersMap[id],
  getAllUsers: () => get().usersMap,

  buyCoupon: (couponId) => {
    const { currentUser, availableCoupons } = get();
    if (!currentUser || !db) return false;
    const coupon = availableCoupons.find(c => c.id === couponId);
    if (!coupon) return false;
    if (currentUser.walletBalance < coupon.cost) return false;

    updateDoc(doc(db, 'users', currentUser.id), {
        walletBalance: increment(-coupon.cost),
        inventory: arrayUnion(coupon.id)
    });
    return true;
  },

  toggleLike: async (entityId, type) => {
      const { currentUser, answers } = get();
      if (!currentUser || !db) return;

      const isLiked = currentUser.likedEntityIds.includes(entityId);
      const userRef = doc(db, 'users', currentUser.id);
      
      // Optimistic update handled by Firestore listener eventually, but local state feedback can be instant if needed
      
      if (isLiked) {
          await updateDoc(userRef, { likedEntityIds: arrayRemove(entityId) });
      } else {
          await updateDoc(userRef, { likedEntityIds: arrayUnion(entityId) });
      }

      const incVal = isLiked ? -1 : 1;
      
      if (type === 'QUESTION') {
          await updateDoc(doc(db, 'questions', entityId), { likes: increment(incVal) });
      } else {
          // Find answer's parent question
          let questionId = null;
          Object.keys(answers).forEach(qid => {
              if (answers[qid].some(a => a.id === entityId)) questionId = qid;
          });
          if (questionId) {
              await updateDoc(doc(db, 'questions', questionId, 'answers', entityId), { likes: increment(incVal) });
          }
      }
  },

  sendTip: async (amount, answerId, currency) => {
    const { currentUser, answers } = get();
    if (!currentUser || !db) return false;
    
    const balanceKey = currency === 'STARS' ? 'starsBalance' : 'walletBalance';
    if (currentUser[balanceKey] < amount) return false;

    let questionId = null;
    Object.keys(answers).forEach(qid => {
        if (answers[qid].some(a => a.id === answerId)) questionId = qid;
    });
    if (!questionId) return false;

    // Atomic decrement
    await updateDoc(doc(db, 'users', currentUser.id), { [balanceKey]: increment(-amount) });
    
    // Atomic increment on answer
    const receiveKey = currency === 'STARS' ? 'starsReceived' : 'coinsReceived';
    await updateDoc(doc(db, 'questions', questionId, 'answers', answerId), { [receiveKey]: increment(amount) });

    return true;
  },

  claimTaskReward: async (taskId) => {
     const { currentUser, tasks } = get();
     if (!currentUser || !db) return;
     const task = tasks.find(t => t.id === taskId);
     if (!task || task.isCompleted) return;
     
     await updateDoc(doc(db, 'users', currentUser.id), {
         walletBalance: increment(task.reward)
     });
     
     // Local state update for "Done" status (in real app, this would be stored in user profile too)
     set(state => ({
         tasks: state.tasks.map(t => t.id === taskId ? { ...t, isCompleted: true } : t)
     }));
  },

  addQuestion: (data) => {
    const { currentUser } = get();
    if(!currentUser || !db) return false;
    if (currentUser.walletBalance < QUESTION_COST) return false;

    const newQData = {
        title: data.title,
        authorId: currentUser.id,
        locationId: data.locationId,
        categoryId: data.categoryId,
        text: data.text,
        attachmentUrls: data.attachments,
        isAnonymous: data.isAnonymous,
        backgroundStyle: data.backgroundStyle || 'white',
        tags: [],
        views: 0,
        likes: 0,
        isSolved: false,
        createdAt: new Date().toISOString(),
    };

    addDoc(collection(db, 'questions'), newQData);
    updateDoc(doc(db, 'users', currentUser.id), {
        walletBalance: increment(-QUESTION_COST)
    });

    set({ questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] } });
    return true;
  },
  
  addAnswer: async (questionId, text, attachmentUrls) => {
      const { currentUser } = get();
      if (!currentUser || !db) return;

      const newAnswerData = {
          questionId,
          authorId: currentUser.id,
          authorName: currentUser.displayName, 
          text,
          attachmentUrls,
          likes: 0,
          starsReceived: 0,
          coinsReceived: 0,
          isAccepted: false,
          createdAt: new Date().toISOString(),
          replies: []
      };

      await addDoc(collection(db, 'questions', questionId, 'answers'), newAnswerData);
  },

  deleteQuestion: async (questionId) => {
      if (!db) return;
      await deleteDoc(doc(db, 'questions', questionId));
  },

  connectWallet: (address) => {
      const { currentUser } = get();
      if (!currentUser || !db) return;
      updateDoc(doc(db, 'users', currentUser.id), { walletAddress: address });
  },

  disconnectWallet: () => {
      const { currentUser } = get();
      if (!currentUser || !db) return;
      updateDoc(doc(db, 'users', currentUser.id), { walletAddress: "" });
  },

  updateQuestionDraft: (draft) => set({ questionDraft: { ...get().questionDraft, ...draft } }),
  clearQuestionDraft: () => set({ questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] } }),

  submitReport: async (entityId, entityType, reason, description) => {
      const { currentUser } = get();
      if (!currentUser || !db) return;
      await addDoc(collection(db, 'reports'), {
          entityId, entityType, reason, description,
          reporterId: currentUser.id,
          status: 'PENDING',
          createdAt: new Date().toISOString()
      });
  },

  resolveReport: async (reportId, action) => {
      // Admin only action - logic in store but enforced by Security Rules in DB
      if (!db) return;
      await updateDoc(doc(db, 'reports', reportId), { status: 'RESOLVED' });
  }
}));