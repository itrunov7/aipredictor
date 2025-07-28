// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscription?: Subscription;
  preferences?: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  status: 'active' | 'inactive' | 'past_due' | 'canceled' | 'trialing';
  plan: 'free' | 'premium';
  priceId: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  id: string;
  userId: string;
  watchlist: string[]; // Array of stock symbols
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    weeklyDigest: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Stock and Financial Data Types
export interface StockData {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  pe: number;
  eps: number;
  dividend: number;
  dividendYield: number;
  beta: number;
  high52Week: number;
  low52Week: number;
  lastUpdated: Date;
}

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: Date;
  volume: number;
}

export interface TechnicalIndicator {
  symbol: string;
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    ema12: number;
    ema26: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  stochastic: {
    k: number;
    d: number;
  };
  timestamp: Date;
}

export interface AnalystTarget {
  symbol: string;
  targetPrice: number;
  recommendation: 'Buy' | 'Sell' | 'Hold' | 'Strong Buy' | 'Strong Sell';
  analyst: string;
  firm: string;
  date: Date;
  priceTarget: {
    high: number;
    low: number;
    average: number;
    median: number;
  };
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  url: string;
  source: string;
  author?: string;
  publishedAt: Date;
  symbols: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  relevanceScore: number;
  imageUrl?: string;
}

export interface EconomicIndicator {
  indicator: string;
  value: number;
  change: number;
  changePercent: number;
  date: Date;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  impact: 'high' | 'medium' | 'low';
  description: string;
}

// Prediction and Forecast Types
export interface PricePrediction {
  symbol: string;
  predictions: {
    nextDay: PredictionRange;
    nextWeek: PredictionRange;
    nextMonth: PredictionRange;
  };
  confidence: {
    overall: number;
    technical: number;
    fundamental: number;
    sentiment: number;
  };
  lastUpdated: Date;
  model: {
    name: string;
    version: string;
    accuracy: number;
  };
}

export interface PredictionRange {
  low: number;
  high: number;
  target: number;
  probability: number;
}

export interface PredictionReason {
  id: string;
  symbol: string;
  category: 'technical' | 'fundamental' | 'news' | 'analyst' | 'macro';
  reason: string;
  impact: 'bullish' | 'bearish' | 'neutral';
  weight: number;
  source: string;
  sourceUrl?: string;
  timestamp: Date;
}

// Insight and Analysis Types
export interface StockInsight {
  id: string;
  symbol: string;
  stockData: StockData;
  prediction: PricePrediction;
  reasons: PredictionReason[];
  technicalIndicators: TechnicalIndicator;
  analystTargets: AnalystTarget[];
  recentNews: NewsArticle[];
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
  isFeatured: boolean;
}

export interface DailyInsights {
  date: Date;
  featuredInsights: StockInsight[];
  marketOverview: {
    sp500Change: number;
    sp500ChangePercent: number;
    topGainers: StockData[];
    topLosers: StockData[];
    mostActive: StockData[];
  };
  economicIndicators: EconomicIndicator[];
  topNews: NewsArticle[];
  lastUpdated: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: any;
}

// Frontend State Types
export interface AppState {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

export interface InsightsState {
  dailyInsights: DailyInsights | null;
  userWatchlist: StockInsight[];
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

// Component Props Types
export interface StockCardProps {
  insight: StockInsight;
  variant?: 'default' | 'featured' | 'compact';
  showActions?: boolean;
  onWatchlistToggle?: (symbol: string) => void;
}

export interface PredictionChartProps {
  prediction: PricePrediction;
  currentPrice: number;
  historicalData?: { date: Date; price: number }[];
}

export interface NewsCardProps {
  article: NewsArticle;
  variant?: 'default' | 'compact';
  showSymbols?: boolean;
}

// Stripe and Payment Types
export interface StripeConfig {
  publishableKey: string;
  monthlyPriceId: string;
  yearlyPriceId: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}

// Utility Types
export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD';
export type SortOrder = 'asc' | 'desc';
export type ChartType = 'line' | 'candlestick' | 'bar';

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
} 