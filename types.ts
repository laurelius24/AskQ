

// Enums
export enum LocationType {
  CITY = 'CITY',
  COUNTRY = 'COUNTRY',
}

export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export type Language = 'en' | 'ru';

// Telegram Types
export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    photo_url?: string;
}

export interface TelegramBackButton {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        user?: TelegramUser;
        start_param?: string;
    };
    ready: () => void;
    expand: () => void;
    close: () => void;
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    platform: string;
    BackButton: TelegramBackButton;
}

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

// Interfaces

// 1. User Profile
export interface User {
  id: string;
  telegramId?: number;
  username: string;
  displayName: string;
  role: UserRole;
  reputationScore: number;
  walletBalance: number;
  starsBalance: number;
  walletAddress?: string;
  avatarUrl?: string;
  bio?: string;
  websiteUrl?: string;
  inventory: string[];
  currentLocationId?: string;
  language?: Language;
  likedEntityIds: string[];
  isBanned?: boolean;
  banExpiresAt?: string;
  
  // Task Tracking
  lastLoginDate?: string; // ISO Date
  loginStreak: number;
  lastMonthlyClaim?: string; // ISO Date
  lastShareDate?: string; // ISO Date
}

// 2. Location
export interface LocationContext {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string;
  flagEmoji?: string;
  backgroundImage?: string;
  phoneCode?: string;
}

// 3. Category
export interface Category {
  id: string;
  name: string;
  icon: string;
}

// 4. Question
export interface Question {
  id: string;
  title: string;
  authorId: string;
  locationId: string;
  categoryId: string;
  text: string;
  attachmentUrls?: string[];
  backgroundStyle?: string;
  isAnonymous: boolean;
  createdAt: string;
  views: number;
  likes: number;
  answerCount: number; // Added field for feed display
  tags: string[];
  isSolved: boolean;
  aiGeneratedSummary?: string;
  bestAnswerSnippet?: string;
}

// 5. Answer
export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName?: string;
  text: string;
  createdAt: string;
  likes: number;
  starsReceived: number;
  coinsReceived: number;
  isAccepted: boolean;
  attachmentUrls?: string[];
  replies?: Answer[];
}

// 6. Marketplace Coupon
export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl: string;
  partnerName: string;
  partnerLogo?: string; // Made optional or removed based on usage
  promoCode: string;
  expiresAt: string;
}

// 7. Earning Task (Static Def)
export interface Task {
    id: string;
    title: string;
    reward: number;
    icon: string;
    type: 'MONTHLY' | 'STREAK' | 'SHARE';
    status: 'LOCKED' | 'READY' | 'DONE' | 'COOLDOWN';
    progress?: string; // e.g. "Day 3/7"
}

// 8. Draft for new Question
export interface QuestionDraft {
    title: string;
    text: string;
    categoryId: string;
    locationId: string;
    isAnonymous: boolean;
    attachments: string[];
}

// 9. Moderation Report
export interface Report {
    id: string;
    entityId: string;
    entityType: 'QUESTION' | 'ANSWER';
    reporterId: string;
    reason: string;
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    createdAt: string;
}

export interface AppState {
  currentUser: User | null;
  selectedLocation: LocationContext | null;
  language: Language;
  isLoading: boolean;
  questionDraft: QuestionDraft;
  reports: Report[];
  telegramUser: TelegramUser | null;
}
