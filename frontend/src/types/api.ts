// User Types
export interface User {
  _id: string
  username: string
  email: string
  firstName: string
  lastName: string
  profilePicture?: string
  isEmailVerified: boolean
  twoFactorEnabled: boolean
  onboardingCompleted?: boolean
  profile?: any
  preferences: {
    theme: 'light' | 'dark'
    currency: string
    language: string
    notifications: {
      email: boolean
      push: boolean
      sms: boolean
    }
  }
  createdAt: string
  updatedAt: string
}

// Authentication Types
export interface LoginCredentials {
  email: string
  password: string
  totpCode?: string
  rememberMe?: boolean
}

export interface RegisterData {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

// Portfolio Types
export interface Portfolio {
  _id: string
  userId: string
  name: string
  description?: string
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  positions: Position[]
  performanceData: PerformanceData[]
  createdAt: string
  updatedAt: string
}

export interface Position {
  _id: string
  symbol: string
  companyName: string
  quantity: number
  averagePrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
  sector: string
  industry: string
  lastUpdated: string
}

export interface PerformanceData {
  date: string
  value: number
  change: number
  changePercent: number
}

// Market Data Types
export interface StockData {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  peRatio: number
  eps: number
  high52Week: number
  low52Week: number
  dividend: number
  dividendYield: number
  sector: string
  industry: string
  lastUpdated: string
}

export interface MarketChart {
  timestamps: string[]
  prices: number[]
  volumes: number[]
}

// AI Insights Types
export interface AIInsight {
  _id: string
  userId: string
  type: 'recommendation' | 'alert' | 'analysis' | 'opportunity'
  title: string
  summary: string
  description: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  actionItems: string[]
  relatedSymbols: string[]
  category: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'active' | 'dismissed' | 'acted_upon'
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

// Watchlist Types
export interface Watchlist {
  _id: string
  userId: string
  name: string
  description?: string
  symbols: WatchlistItem[]
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export interface WatchlistItem {
  symbol: string
  companyName: string
  currentPrice: number
  change: number
  changePercent: number
  addedAt: string
  alerts?: PriceAlert[]
}

// Alerts Types
export interface PriceAlert {
  _id: string
  userId: string
  symbol: string
  type: 'price_above' | 'price_below' | 'change_percent' | 'volume'
  condition: number
  isActive: boolean
  isTriggered: boolean
  triggeredAt?: string
  message: string
  createdAt: string
}

// Transaction Types
export interface Transaction {
  _id: string
  userId: string
  portfolioId: string
  type: 'buy' | 'sell'
  symbol: string
  companyName: string
  quantity: number
  price: number
  totalAmount: number
  fees: number
  notes?: string
  executedAt: string
  createdAt: string
}

// Dashboard Types
export interface DashboardData {
  portfolios: Portfolio[]
  totalValue: number
  totalGainLoss: number
  totalGainLossPercent: number
  topPerformers: Position[]
  recentTransactions: Transaction[]
  aiInsights: AIInsight[]
  marketSummary: {
    indices: MarketIndex[]
    topMovers: StockData[]
    sectorPerformance: SectorPerformance[]
  }
}

export interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

export interface SectorPerformance {
  sector: string
  change: number
  changePercent: number
  topStock: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Error Types
export interface ApiError {
  success: false
  error: string
  message: string
  statusCode: number
  details?: any
}
