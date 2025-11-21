

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
  telegramId?: number; // Link to Telegram account
  username: string;
  displayName: string;
  role: UserRole;
  reputationScore: number; // Points based on helpful answers
  walletBalance: number; // Virtual currency from likes (internal)
  starsBalance: number; // Telegram Stars (Real value)
  walletAddress?: string; // TON Wallet address
  avatarUrl?: string;
  bio?: string; // User description
  websiteUrl?: string; // Link to channel or site
  inventory: string[]; // IDs of purchased coupons
  currentLocationId?: string; // Persisted user preference
  language?: Language; // Preferred language
  likedEntityIds: string[]; // IDs of questions/answers liked by user
  isBanned?: boolean;
  banExpiresAt?: string;
}

// 2. Location (The core context of the app)
export interface LocationContext {
  id: string;
  name: string;
  type: LocationType;
  parentId?: string; // e.g., if City, parent is Country ID
  flagEmoji?: string;
  backgroundImage?: string;
  phoneCode?: string; // Country calling code (e.g., "420")
}

// 3. Category
export interface Category {
  id: string;
  name: string; // Translation key suffix
  icon: string;
}

// 4. Question
export interface Question {
  id: string;
  title: string; // New Title field
  authorId: string;
  locationId: string; // The context (e.g., "Paris")
  categoryId: string;
  text: string; // Description
  attachmentUrls?: string[]; // Images/Docs
  backgroundStyle?: string; // Hex color or class name for card background
  isAnonymous: boolean;
  createdAt: string; // ISO Date string
  views: number;
  likes: number; // Total likes
  tags: string[]; // Keeping tags for backward compatibility or AI keywords
  isSolved: boolean;
  aiGeneratedSummary?: string; // For Gemini integration later
  bestAnswerSnippet?: string; // Short text of the accepted answer to show in feed
}

// 5. Answer
export interface Answer {
  id: string;
  questionId: string;
  authorId: string;
  authorName?: string; // Temporary/Denormalized
  text: string;
  createdAt: string;
  likes: number;
  starsReceived: number; // Total stars tipped for this answer
  coinsReceived: number; // Total coins tipped for this answer
  isAccepted: boolean; // If the question author marked this as helpful
  attachmentUrls?: string[]; // New: Images in answers
  replies?: Answer[]; // New: Nested comments
}

// 6. Marketplace Coupon
export interface Coupon {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl: string;
  partnerName: string; // Who provides the coupon
  promoCode: string; // The code revealed after purchase
  expiresAt: string; // ISO Date string for expiration
}

// 7. Earning Task
export interface Task {
    id: string;
    title: string;
    reward: number;
    icon: string;
    isCompleted: boolean;
    type: 'DAILY' | 'ONE_TIME';
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
    entityId: string; // ID of Question or Answer
    entityType: 'QUESTION' | 'ANSWER';
    reporterId: string;
    reason: string;
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
    createdAt: string;
}

// App State Structure (used in Store)
export interface AppState {
  currentUser: User | null;
  selectedLocation: LocationContext | null;
  language: Language;
  isLoading: boolean;
  questionDraft: QuestionDraft; // Persist form data
  reports: Report[];
  telegramUser: TelegramUser | null; // Data from Telegram SDK
}