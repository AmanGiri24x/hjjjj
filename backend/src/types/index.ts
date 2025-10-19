import { Request, Response } from 'express';
import { Document, Types } from 'mongoose';

// Base interfaces
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  role: UserRole;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  lastActiveAt?: Date;
  isActive: boolean;
  refreshTokens?: Array<{
    token: string;
    createdAt: Date;
    expiresAt: Date;
    deviceInfo?: string;
  }>;
  socialAccounts?: Array<{
    provider: string;
    providerId: string;
    email?: string;
    connectedAt: Date;
  }>;
  preferences: IUserPreferences;
  subscription: ISubscription;
  portfolio: IPortfolio;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  updateLastActive(): Promise<IUser>;
  addRefreshToken(token: string, deviceInfo?: string): void;
  removeRefreshToken(token: string): void;
  cleanExpiredTokens(): Promise<IUser>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<IUser>;
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dashboard: {
    defaultView: 'overview' | 'portfolio' | 'analytics';
    refreshInterval: number;
  };
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  investmentGoals: string[];
}

export interface ISubscription {
  plan: SubscriptionPlan;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface IPortfolio extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  totalValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  holdings: IHolding[];
  performance: IPerformanceMetric[];
  riskMetrics: IRiskMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHolding {
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPercentage: number;
  weight: number;
  sector?: string;
  exchange?: string;
  currency: string;
  lastUpdated: Date;
}

export interface IPerformanceMetric {
  date: Date;
  value: number;
  return1Day: number;
  return7Day: number;
  return30Day: number;
  return90Day: number;
  return1Year: number;
  volatility: number;
  sharpeRatio: number;
  beta: number;
}

export interface IRiskMetrics {
  volatility: number;
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  conditionalValueAtRisk: number;
  riskScore: number;
  diversificationRatio: number;
}

export interface IMarketData extends Document {
  _id: Types.ObjectId;
  symbol: string;
  name: string;
  type: AssetType;
  price: number;
  previousClose: number;
  change: number;
  changePercentage: number;
  volume: number;
  marketCap?: number;
  high52Week: number;
  low52Week: number;
  dividend?: number;
  dividendYield?: number;
  pe?: number;
  eps?: number;
  beta?: number;
  sector?: string;
  exchange: string;
  currency: string;
  timestamp: Date;
  priceHistory: IPricePoint[];
}

export interface IPricePoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

export interface INewsArticle extends Document {
  _id: Types.ObjectId;
  title: string;
  summary: string;
  content?: string;
  author?: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: Date;
  symbols: string[];
  sentiment: SentimentScore;
  category: NewsCategory;
  relevanceScore: number;
  createdAt: Date;
}

export interface IAIInsight extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  type: InsightType;
  title: string;
  description: string;
  summary: string;
  recommendation: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  timeline: string;
  symbols?: string[];
  category: InsightCategory;
  data: any;
  status: 'active' | 'expired' | 'dismissed';
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlert extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  type: AlertType;
  title: string;
  message: string;
  symbol?: string;
  condition: IAlertCondition;
  isActive: boolean;
  isTriggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAlertCondition {
  field: 'price' | 'change' | 'volume' | 'marketCap';
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  percentage?: boolean;
}

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  portfolioId: Types.ObjectId;
  type: TransactionType;
  symbol: string;
  quantity: number;
  price: number;
  amount: number;
  fees: number;
  currency: string;
  executedAt: Date;
  notes?: string;
  createdAt: Date;
}

export interface IWatchlist extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  description?: string;
  symbols: string[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums and types
export type UserRole = 'user' | 'premium' | 'admin' | 'analyst';
export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type AssetType = 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity' | 'forex' | 'option' | 'future';
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'split' | 'merger' | 'spinoff';
export type NewsCategory = 'earnings' | 'merger' | 'ipo' | 'analyst' | 'general' | 'regulatory' | 'economic';
export type InsightType = 'recommendation' | 'risk_alert' | 'opportunity' | 'market_trend' | 'portfolio_optimization';
export type InsightCategory = 'market_trend' | 'risk_alert' | 'growth_opportunity' | 'portfolio_optimization';
export type AlertType = 'price' | 'news' | 'earnings' | 'analyst' | 'technical' | 'portfolio';
export type SentimentScore = 'very_negative' | 'negative' | 'neutral' | 'positive' | 'very_positive';

// API Response types
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: IPagination;
  meta?: any;
}

export interface IPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Request/Response extensions
export interface AuthRequest extends Request {
  user?: IUser;
  tokenData?: any;
}

export interface AuthResponse extends Response {
  locals: {
    user?: IUser;
  };
}

// External API types
export interface IStockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: number;
}

export interface ICryptoQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  marketCap: number;
  timestamp: number;
}

// WebSocket types
export interface IWebSocketMessage {
  type: 'price_update' | 'news_update' | 'portfolio_update' | 'alert' | 'insight';
  data: any;
  timestamp: number;
}

export interface IWebSocketClient {
  id: string;
  userId?: string;
  subscriptions: string[];
  lastPing: number;
}

// Utility types
export type Nullable<T> = T | null;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
