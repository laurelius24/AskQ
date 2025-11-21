
import { create } from 'zustand';
import { AppState, LocationContext, User, UserRole, LocationType, Coupon, Language, Question, Category, Task, Answer, QuestionDraft, Report, TelegramUser } from './types';
import { db } from './services/firebase';
import { 
  collection, addDoc, onSnapshot, query, orderBy, doc, 
  updateDoc, arrayUnion, arrayRemove, setDoc, getDoc, 
  where, increment, deleteDoc, getDocs, runTransaction, writeBatch
} from 'firebase/firestore';

// --- ECONOMY CONSTANTS ---
export const QUESTION_COST = 50;       // Cost to ask
export const ANSWER_REWARD = 5;        // Reward for answering
export const BEST_ANSWER_BONUS = 20;   // Reward if answer selected as best
export const MONTHLY_REWARD = 150;     // 3 questions worth
export const STREAK_REWARD = 100;      // 7 days streak
export const SHARE_REWARD = 20;        // Share reward
export const MIN_LIKES_FOR_BEST = 5;   // Threshold for best answer

// Categories (Static Config)
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

// Locations (Static Config)
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
    if (a.id === 'cz') return -1;
    if (b.id === 'cz') return 1;
    if (a.id === 'cz_prg') return -1;
    if (b.id === 'cz_prg') return 1;
    const aIsCz = a.id.startsWith('cz');
    const bIsCz = b.id.startsWith('cz');
    if (aIsCz && !bIsCz) return -1;
    if (!aIsCz && bIsCz) return 1;
    return a.name.localeCompare(b.name);
});

const sanitizeData = (data: any): any => {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  // Check for Firestore circular references (like firestore instance)
  if ('firestore' in data || 'app' in data) return null; 
  
  if (data.toDate && typeof data.toDate === 'function') {
    return data.toDate().toISOString();
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeData).filter(item => item !== null);
  }
  const sanitized: any = {};
  for (const key in data) {
    const val = sanitizeData(data[key]);
    if (val !== null) sanitized[key] = val;
  }
  return sanitized;
};

interface Store extends AppState {
  savedScrollPositions: Record<string, number>;
  questions: Question[];
  answers: Record<string, Answer[]>;
  categories: Category[];
  availableLocations: LocationContext[];
  availableCoupons: Coupon[];
  usersMap: Record<string, User>; 
  
  // Dynamic Tasks based on user state
  getTasks: () => Task[];

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
  
  // Task Actions
  checkAndClaimTask: (type: 'MONTHLY' | 'STREAK' | 'SHARE') => Promise<void>;
  
  addQuestion: (data: { title: string, text: string, categoryId: string, locationId: string, isAnonymous: boolean, attachments: string[], backgroundStyle?: string }) => Promise<boolean>;
  addAnswer: (questionId: string, text: string, attachmentUrls: string[]) => Promise<void>;
  addReply: (questionId: string, parentAnswerId: string, text: string, attachments?: string[]) => Promise<void>;
  markAnswerAsBest: (questionId: string, answerId: string) => Promise<void>;
  deleteQuestion: (questionId: string) => Promise<void>;
  deleteAnswer: (questionId: string, answerId: string) => Promise<void>;
  toggleLike: (entityId: string, type: 'QUESTION' | 'ANSWER') => Promise<void>;
  
  saveScrollPosition: (path: string, position: number) => void;
  connectWallet: (address: string) => void;
  disconnectWallet: () => void;

  updateQuestionDraft: (draft: Partial<QuestionDraft>) => void;
  clearQuestionDraft: () => void;

  submitReport: (entityId: string, entityType: 'QUESTION' | 'ANSWER', reason: string, description: string) => Promise<void>;
  resolveReport: (reportId: string, action: 'DISMISS' | 'DELETE' | 'BAN_24H' | 'BAN_FOREVER') => Promise<void>;
  
  seedDatabase: () => Promise<void>;
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
  availableCoupons: [], 
  questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] },
  reports: [],
  usersMap: {},
  telegramUser: null,

  initializeListeners: () => {
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

      if (!db) {
          console.warn("Firestore DB not found.");
          set({ isLoading: false });
          return;
      }

      // Questions Listener
      const qQuery = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
      const unsubQuestions = onSnapshot(qQuery, (snapshot) => {
          const questions = snapshot.docs.map(d => ({ id: d.id, ...sanitizeData(d.data()) } as Question));
          set({ questions });
      });

      // Users Listener
      const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
          const usersMap: Record<string, User> = {};
          snapshot.forEach(doc => {
              usersMap[doc.id] = { id: doc.id, ...sanitizeData(doc.data()) } as User;
          });
          const current = get().currentUser;
          if (current && usersMap[current.id]) {
              set({ currentUser: usersMap[current.id] });
          }
          set({ usersMap });
      });

      // Coupons Listener
      const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
          const coupons = snapshot.docs.map(d => ({ id: d.id, ...sanitizeData(d.data()) } as Coupon));
          set({ availableCoupons: coupons });
      });

      // Reports Listener
      const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
        const reports = snapshot.docs.map(d => ({ id: d.id, ...sanitizeData(d.data()) } as Report));
        set({ reports });
      });

      // Auth Logic with Daily Streak Check
      const authenticate = async () => {
          const { telegramUser } = get();
          let userFound = null;
          let docRef = null;

          // 1. Try logging in via Telegram ID
          if (telegramUser) {
              const q = query(collection(db, 'users'), where('telegramId', '==', telegramUser.id));
              const querySnapshot = await getDocs(q);
              if (!querySnapshot.empty) {
                  docRef = querySnapshot.docs[0].ref;
                  const d = querySnapshot.docs[0].data();
                  userFound = { id: docRef.id, ...sanitizeData(d) } as User;
              }
          } 

          // 2. Try logging in via Local Storage (Fallback for testing outside TG)
          if (!userFound) {
              const storedId = localStorage.getItem('askq_userid');
              if (storedId) {
                  docRef = doc(db, 'users', storedId);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                      userFound = { id: docSnap.id, ...sanitizeData(docSnap.data()) } as User;
                  }
              }
          }

          if (userFound && docRef) {
              // LOGIN STREAK LOGIC
              const now = new Date();
              const lastLogin = userFound.lastLoginDate ? new Date(userFound.lastLoginDate) : new Date(0);
              const diffHours = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
              
              let newStreak = userFound.loginStreak || 0;
              
              // If different day
              if (now.getDate() !== lastLogin.getDate() || now.getMonth() !== lastLogin.getMonth()) {
                  if (diffHours < 48) {
                      newStreak += 1;
                  } else {
                      newStreak = 1; // Reset if missed a day
                  }
              }

              updateDoc(docRef, {
                  lastLoginDate: now.toISOString(),
                  loginStreak: newStreak
              });
              
              userFound.loginStreak = newStreak; // Update local
              set({ currentUser: userFound });
              
              // Set location from user profile if exists, otherwise Default to Prague if user has no location yet
              if (userFound.currentLocationId) {
                   const loc = MOCK_LOCATIONS.find(l => l.id === userFound.currentLocationId);
                   if (loc) set({ selectedLocation: loc });
              } else {
                   // Default to Prague if fresh user
                   const defaultLoc = MOCK_LOCATIONS.find(l => l.id === 'cz_prg') || MOCK_LOCATIONS[0];
                   set({ selectedLocation: defaultLoc });
                   updateDoc(docRef, { currentLocationId: defaultLoc.id });
              }
          } else {
              // Seed if needed on first load without auth
              get().seedDatabase();
          }

          set({ isLoading: false });
      };

      authenticate();
      
      // Clean up listeners on unmount
      return () => { unsubQuestions(); unsubUsers(); unsubCoupons(); unsubReports(); };
  },

  getTasks: () => {
      const { currentUser } = get();
      if (!currentUser) return [];

      const now = new Date();
      
      // 1. Monthly Task
      const lastMonthly = currentUser.lastMonthlyClaim ? new Date(currentUser.lastMonthlyClaim) : new Date(0);
      const daysSinceMonthly = (now.getTime() - lastMonthly.getTime()) / (1000 * 60 * 60 * 24);
      const monthlyStatus = daysSinceMonthly >= 30 ? 'READY' : 'COOLDOWN';
      
      // 2. Streak Task
      const streakStatus = currentUser.loginStreak >= 7 ? 'READY' : 'LOCKED';
      
      // 3. Share Task
      const lastShare = currentUser.lastShareDate ? new Date(currentUser.lastShareDate) : new Date(0);
      const hoursSinceShare = (now.getTime() - lastShare.getTime()) / (1000 * 60 * 60);
      const shareStatus = hoursSinceShare >= 24 ? 'READY' : 'COOLDOWN';

      return [
          {
              id: 'task_monthly',
              title: 'task.monthly',
              reward: MONTHLY_REWARD,
              icon: 'calendar',
              type: 'MONTHLY',
              status: monthlyStatus,
              progress: monthlyStatus === 'COOLDOWN' ? `${30 - Math.floor(daysSinceMonthly)} days left` : undefined
          },
          {
              id: 'task_streak',
              title: 'task.streak',
              reward: STREAK_REWARD,
              icon: 'user',
              type: 'STREAK',
              status: streakStatus,
              progress: `${Math.min(currentUser.loginStreak, 7)}/7 days`
          },
          {
              id: 'task_share',
              title: 'task.share',
              reward: SHARE_REWARD,
              icon: 'share',
              type: 'SHARE',
              status: shareStatus
          }
      ];
  },

  checkAndClaimTask: async (type) => {
      const { currentUser } = get();
      if (!currentUser || !db) return;

      const userRef = doc(db, 'users', currentUser.id);
      const now = new Date().toISOString();

      try {
          if (type === 'MONTHLY') {
               await updateDoc(userRef, {
                   walletBalance: increment(MONTHLY_REWARD),
                   lastMonthlyClaim: now
               });
          } else if (type === 'STREAK') {
               if (currentUser.loginStreak < 7) return;
               await updateDoc(userRef, {
                   walletBalance: increment(STREAK_REWARD),
                   loginStreak: 0 
               });
          } else if (type === 'SHARE') {
               await updateDoc(userRef, {
                   walletBalance: increment(SHARE_REWARD),
                   lastShareDate: now
               });
          }
      } catch (e) {
          console.error(e);
      }
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
    if (currentUser && db) updateDoc(doc(db, 'users', currentUser.id), { currentLocationId: location.id });
  },

  setLanguage: (lang) => {
    set({ language: lang });
    const { currentUser } = get();
    if (currentUser && db) updateDoc(doc(db, 'users', currentUser.id), { language: lang });
  },

  saveScrollPosition: (path, position) => set(state => ({ savedScrollPositions: { ...state.savedScrollPositions, [path]: position } })),
  setUser: (user) => set({ currentUser: user }),
  
  registerUser: async (name, username, avatarUrl, bio = '', websiteUrl = '') => {
    if (!db) return;
    const { language, telegramUser } = get();
    const cleanUsername = username.trim().toLowerCase();

    const newUser = {
        username: cleanUsername,
        displayName: name,
        role: UserRole.USER, 
        reputationScore: 0,
        walletBalance: MONTHLY_REWARD, 
        starsBalance: 0, 
        avatarUrl: avatarUrl,
        bio,
        websiteUrl,
        inventory: [],
        language,
        likedEntityIds: [],
        telegramId: telegramUser?.id || null,
        loginStreak: 1,
        lastLoginDate: new Date().toISOString(),
        questionsThisMonth: 0,
        lastQuestionMonth: `${new Date().getFullYear()}-${new Date().getMonth() + 1}`
    };
    
    try {
        const docRef = await addDoc(collection(db, 'users'), newUser);
        const userWithId = { ...newUser, id: docRef.id } as unknown as User;
        set({ currentUser: userWithId });
        localStorage.setItem('askq_userid', docRef.id);
    } catch (e) { console.error(e); }
  },

  updateUserProfile: async (updates) => {
      const { currentUser } = get();
      if (currentUser && db) await updateDoc(doc(db, 'users', currentUser.id), updates);
  },

  getUserById: (id) => get().usersMap[id],
  getAllUsers: () => get().usersMap,

  buyCoupon: (couponId) => {
    const { currentUser, availableCoupons } = get();
    if (!currentUser || !db) return false;
    const coupon = availableCoupons.find(c => c.id === couponId);
    if (!coupon || currentUser.walletBalance < coupon.cost) return false;

    try {
        runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', currentUser.id);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists() || userDoc.data().walletBalance < coupon.cost) throw "Error";
            transaction.update(userRef, {
                walletBalance: increment(-coupon.cost),
                inventory: arrayUnion(coupon.id)
            });
        });
        return true;
    } catch (e) { return false; }
  },

  toggleLike: async (entityId, type) => {
      const { currentUser, answers } = get();
      if (!currentUser || !db) return;
      const isLiked = currentUser.likedEntityIds.includes(entityId);
      const userRef = doc(db, 'users', currentUser.id);
      
      if (isLiked) await updateDoc(userRef, { likedEntityIds: arrayRemove(entityId) });
      else await updateDoc(userRef, { likedEntityIds: arrayUnion(entityId) });

      const incVal = isLiked ? -1 : 1;
      if (type === 'QUESTION') {
          await updateDoc(doc(db, 'questions', entityId), { likes: increment(incVal) });
      } else {
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
    Object.keys(answers).forEach(qid => { if (answers[qid].some(a => a.id === answerId)) questionId = qid; });
    if (!questionId) return false;

    try {
         runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', currentUser.id);
            const ansRef = doc(db, 'questions', questionId, 'answers', answerId);
            const userDoc = await transaction.get(userRef);
            if (userDoc.data()![balanceKey] < amount) throw "Low balance";
            transaction.update(userRef, { [balanceKey]: increment(-amount) });
            const receiveKey = currency === 'STARS' ? 'starsReceived' : 'coinsReceived';
            transaction.update(ansRef, { [receiveKey]: increment(amount) });
         });
         return true;
    } catch (e) { return false; }
  },

  addQuestion: async (data) => {
    const { currentUser } = get();
    if(!currentUser || !db) return false;

    // Check monthly limit & Balance
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${now.getMonth() + 1}`;
    let questionsThisMonth = currentUser.questionsThisMonth || 0;
    let cost = 0;

    // If user is in new month, reset usage (logic handled implicitly by just checking date)
    if (currentUser.lastQuestionMonth !== currentMonthStr) {
        questionsThisMonth = 0;
    }

    // First 3 questions free per month
    if (questionsThisMonth >= 3) {
        cost = QUESTION_COST;
        if (currentUser.walletBalance < cost) return false;
    }

    const newQData = {
        title: data.title,
        authorId: currentUser.id,
        locationId: data.locationId,
        categoryId: data.categoryId,
        text: data.text,
        attachmentUrls: data.attachments,
        isAnonymous: data.isAnonymous,
        backgroundStyle: 'white',
        tags: [],
        views: 0,
        likes: 0,
        answerCount: 0,
        isSolved: false,
        createdAt: new Date().toISOString(),
    };

    try {
        await addDoc(collection(db, 'questions'), newQData);
        
        const userUpdate: any = {
            lastQuestionMonth: currentMonthStr,
            questionsThisMonth: questionsThisMonth + 1
        };
        if (cost > 0) {
            userUpdate.walletBalance = increment(-cost);
        }
        
        await updateDoc(doc(db, 'users', currentUser.id), userUpdate);
        
        set({ questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] } });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
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
      
      updateDoc(doc(db, 'questions', questionId), { answerCount: increment(1) });

      updateDoc(doc(db, 'users', currentUser.id), {
          walletBalance: increment(ANSWER_REWARD),
          reputationScore: increment(1)
      });
  },

  addReply: async (questionId, parentAnswerId, text, attachments = []) => {
      const { currentUser } = get();
      if (!currentUser || !db) return;

      const replyData = {
          authorId: currentUser.id,
          authorName: currentUser.displayName,
          text: text,
          createdAt: new Date().toISOString(),
          attachmentUrls: attachments
      };

      const answerRef = doc(db, 'questions', questionId, 'answers', parentAnswerId);
      await updateDoc(answerRef, {
          replies: arrayUnion(replyData)
      });
      
      // Increment global answer/comment count for the question
      updateDoc(doc(db, 'questions', questionId), { answerCount: increment(1) });
  },

  deleteAnswer: async (questionId, answerId) => {
      if (!db) return;
      
      // First get the answer to see how many replies it has
      const ansRef = doc(db, 'questions', questionId, 'answers', answerId);
      const ansSnap = await getDoc(ansRef);
      let countToRemove = 1; // The answer itself
      
      if (ansSnap.exists()) {
          const data = ansSnap.data();
          if (data.replies && Array.isArray(data.replies)) {
              countToRemove += data.replies.length;
          }
      }

      await deleteDoc(ansRef);
      updateDoc(doc(db, 'questions', questionId), { answerCount: increment(-countToRemove) });
  },

  markAnswerAsBest: async (questionId, answerId) => {
      if (!db) return;
      await updateDoc(doc(db, 'questions', questionId), { isSolved: true });
      await updateDoc(doc(db, 'questions', questionId, 'answers', answerId), { isAccepted: true });
      
      // Bonus for best answer author
      const ansSnap = await getDoc(doc(db, 'questions', questionId, 'answers', answerId));
      if (ansSnap.exists()) {
          const authorId = ansSnap.data().authorId;
          await updateDoc(doc(db, 'users', authorId), { walletBalance: increment(BEST_ANSWER_BONUS) });
      }
  },

  deleteQuestion: async (questionId) => { if (db) await deleteDoc(doc(db, 'questions', questionId)); },
  connectWallet: (address) => { if (get().currentUser && db) updateDoc(doc(db, 'users', get().currentUser!.id), { walletAddress: address }); },
  disconnectWallet: () => { if (get().currentUser && db) updateDoc(doc(db, 'users', get().currentUser!.id), { walletAddress: "" }); },
  updateQuestionDraft: (draft) => set({ questionDraft: { ...get().questionDraft, ...draft } }),
  clearQuestionDraft: () => set({ questionDraft: { title: '', text: '', categoryId: '', locationId: '', isAnonymous: false, attachments: [] } }),

  submitReport: async (entityId, entityType, reason, description) => {
      const { currentUser } = get();
      if (currentUser && db) await addDoc(collection(db, 'reports'), { entityId, entityType, reason, description, reporterId: currentUser.id, status: 'PENDING', createdAt: new Date().toISOString() });
  },

  resolveReport: async (reportId, action) => {
      if (!db) return;
      const { reports, answers } = get();
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      const reportRef = doc(db, 'reports', reportId);

      try {
          if (action === 'DISMISS') {
               await updateDoc(reportRef, { status: 'DISMISSED' });
          } else {
               if (action === 'DELETE') {
                   if (report.entityType === 'QUESTION') {
                       await deleteDoc(doc(db, 'questions', report.entityId));
                   } else if (report.entityType === 'ANSWER') {
                       const qId = Object.keys(answers).find(qid => answers[qid].some(a => a.id === report.entityId));
                       if (qId) {
                           const ansRef = doc(db, 'questions', qId, 'answers', report.entityId);
                           await deleteDoc(ansRef);
                           updateDoc(doc(db, 'questions', qId), { answerCount: increment(-1) }); 
                       } 
                   }
               }
               await updateDoc(reportRef, { status: 'RESOLVED' });
          }
      } catch (e) {
          console.error("Error resolving report:", e);
      }
  },
  
  seedDatabase: async () => {
      if (!db) return;
      // Check if coupons exist
      const couponsSnap = await getDocs(collection(db, 'coupons'));
      if (couponsSnap.empty) {
          const MOCK_COUPONS = [
              { title: '10% OFF Electronics', description: 'Get 10% off on all electronics at Alza.cz. Valid for purchases over 1000 CZK.', cost: 50, imageUrl: 'https://cdn.alza.cz/foto/f3/UA/UA107g6.jpg', partnerName: 'Alza.cz', promoCode: 'ALZA10ASK', expiresAt: '2024-12-31' },
              { title: 'Free Delivery', description: 'Free delivery on your next order from Rohlik.cz.', cost: 30, imageUrl: 'https://www.rohlik.cz/assets/images/logo.svg', partnerName: 'Rohlik.cz', promoCode: 'FREEROHLIK', expiresAt: '2024-06-30' },
              { title: '200 CZK Voucher', description: 'Discount voucher for Wolt orders.', cost: 100, imageUrl: 'https://cdn.worldvectorlogo.com/logos/wolt-1.svg', partnerName: 'Wolt', promoCode: 'WOLT200', expiresAt: '2024-12-31' }
          ];
          MOCK_COUPONS.forEach(c => addDoc(collection(db, 'coupons'), c));
      }
  }
}));