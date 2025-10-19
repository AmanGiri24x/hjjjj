import mongoose, { Schema } from 'mongoose';
import { IWatchlist, IWatchlistItem, IPriceAlert } from '../types';

const priceAlertSchema = new Schema<IPriceAlert>({
  type: {
    type: String,
    enum: ['price_above', 'price_below', 'change_percent_above', 'change_percent_below'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isTriggered: {
    type: Boolean,
    default: false,
  },
  triggeredAt: {
    type: Date,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
}, {
  _id: false,
});

const watchlistItemSchema = new Schema<IWatchlistItem>({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['stock', 'etf', 'crypto', 'bond', 'commodity', 'forex'],
    required: true,
  },
  exchange: {
    type: String,
    required: true,
    uppercase: true,
  },
  sector: {
    type: String,
    trim: true,
    index: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  addedPrice: {
    type: Number,
    min: 0,
  },
  currentPrice: {
    type: Number,
    min: 0,
  },
  priceChange: {
    type: Number,
  },
  priceChangePercent: {
    type: Number,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  priceAlerts: [priceAlertSchema],
  notes: {
    type: String,
    maxlength: 500,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  targetPrice: {
    type: Number,
    min: 0,
  },
  stopLoss: {
    type: Number,
    min: 0,
  },
  expectedReturn: {
    type: Number,
  },
  riskRating: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    default: 'medium',
  },
  analysisData: {
    technicalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    fundamentalScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    sentimentScore: {
      type: Number,
      min: -1,
      max: 1,
    },
    analystRating: {
      type: String,
      enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'],
    },
    priceTarget: {
      type: Number,
      min: 0,
    },
    lastAnalysisUpdate: {
      type: Date,
    },
  },
  performanceMetrics: {
    dayChange: {
      type: Number,
    },
    weekChange: {
      type: Number,
    },
    monthChange: {
      type: Number,
    },
    yearChange: {
      type: Number,
    },
    volatility: {
      type: Number,
      min: 0,
    },
    beta: {
      type: Number,
    },
    volume: {
      type: Number,
      min: 0,
    },
    marketCap: {
      type: Number,
      min: 0,
    },
    pe: {
      type: Number,
      min: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  _id: false,
});

const watchlistSchema = new Schema<IWatchlist>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  type: {
    type: String,
    enum: ['general', 'sector_focus', 'trading', 'long_term', 'research', 'custom'],
    default: 'general',
    index: true,
  },
  items: [watchlistItemSchema],
  isPublic: {
    type: Boolean,
    default: false,
    index: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#3B82F6', // Blue color
    match: /^#[0-9A-Fa-f]{6}$/,
  },
  sortBy: {
    type: String,
    enum: ['symbol', 'name', 'price', 'change', 'change_percent', 'volume', 'market_cap', 'added_date', 'priority'],
    default: 'added_date',
  },
  sortOrder: {
    type: String,
    enum: ['asc', 'desc'],
    default: 'desc',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  }],
  followers: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    followedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  followersCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  settings: {
    autoUpdate: {
      type: Boolean,
      default: true,
    },
    updateInterval: {
      type: Number, // in minutes
      default: 5,
      min: 1,
      max: 1440,
    },
    enableAlerts: {
      type: Boolean,
      default: true,
    },
    alertMethods: [{
      type: String,
      enum: ['email', 'push', 'in_app'],
      default: 'in_app',
    }],
    showExtendedHours: {
      type: Boolean,
      default: false,
    },
    showNews: {
      type: Boolean,
      default: true,
    },
    showAnalysis: {
      type: Boolean,
      default: true,
    },
  },
  metadata: {
    totalValue: {
      type: Number,
      min: 0,
      default: 0,
    },
    averageChange: {
      type: Number,
      default: 0,
    },
    topPerformer: {
      symbol: String,
      change: Number,
    },
    worstPerformer: {
      symbol: String,
      change: Number,
    },
    totalAlerts: {
      type: Number,
      default: 0,
      min: 0,
    },
    activeAlerts: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastFullUpdate: {
      type: Date,
    },
    avgPriceTarget: {
      type: Number,
      min: 0,
    },
    sectorsRepresented: [{
      sector: String,
      count: Number,
      percentage: Number,
    }],
  },
}, {
  timestamps: true,
});

// Indexes for optimal query performance
watchlistSchema.index({ userId: 1, createdAt: -1 });
watchlistSchema.index({ userId: 1, name: 1 }, { unique: true });
watchlistSchema.index({ isPublic: 1, followersCount: -1 });
watchlistSchema.index({ type: 1, isPublic: 1 });
watchlistSchema.index({ tags: 1, isPublic: 1 });
watchlistSchema.index({ 'items.symbol': 1 });
watchlistSchema.index({ 'items.sector': 1 });
watchlistSchema.index({ 'items.priority': 1 });
watchlistSchema.index({ 'followers.userId': 1 });

// Compound indexes
watchlistSchema.index({
  userId: 1,
  type: 1,
  createdAt: -1,
});

watchlistSchema.index({
  isPublic: 1,
  type: 1,
  followersCount: -1,
});

// Methods
watchlistSchema.methods.addItem = function(itemData: Partial<IWatchlistItem>) {
  // Check if item already exists
  const existingItem = this.items.find((item: IWatchlistItem) => 
    item.symbol === itemData.symbol?.toUpperCase()
  );
  
  if (existingItem) {
    throw new Error(`${itemData.symbol} is already in this watchlist`);
  }
  
  const newItem = {
    ...itemData,
    symbol: itemData.symbol?.toUpperCase(),
    addedAt: new Date(),
    isActive: true,
  } as IWatchlistItem;
  
  this.items.push(newItem);
  this.updateMetadata();
  
  return this.save();
};

watchlistSchema.methods.removeItem = function(symbol: string) {
  const initialLength = this.items.length;
  this.items = this.items.filter((item: IWatchlistItem) => 
    item.symbol !== symbol.toUpperCase()
  );
  
  if (this.items.length === initialLength) {
    throw new Error(`${symbol} not found in watchlist`);
  }
  
  this.updateMetadata();
  return this.save();
};

watchlistSchema.methods.updateItem = function(symbol: string, updateData: Partial<IWatchlistItem>) {
  const item = this.items.find((item: IWatchlistItem) => 
    item.symbol === symbol.toUpperCase()
  );
  
  if (!item) {
    throw new Error(`${symbol} not found in watchlist`);
  }
  
  Object.assign(item, {
    ...updateData,
    lastUpdated: new Date(),
  });
  
  this.updateMetadata();
  return this.save();
};

watchlistSchema.methods.updateItemPrice = function(symbol: string, priceData: {
  currentPrice: number;
  priceChange?: number;
  priceChangePercent?: number;
}) {
  const item = this.items.find((item: IWatchlistItem) => 
    item.symbol === symbol.toUpperCase()
  );
  
  if (!item) return;
  
  item.currentPrice = priceData.currentPrice;
  if (priceData.priceChange !== undefined) item.priceChange = priceData.priceChange;
  if (priceData.priceChangePercent !== undefined) item.priceChangePercent = priceData.priceChangePercent;
  item.lastUpdated = new Date();
  
  // Check price alerts
  this.checkPriceAlerts(symbol, priceData.currentPrice, priceData.priceChangePercent);
  
  this.updateMetadata();
};

watchlistSchema.methods.checkPriceAlerts = function(symbol: string, currentPrice: number, changePercent?: number) {
  const item = this.items.find((item: IWatchlistItem) => 
    item.symbol === symbol.toUpperCase()
  );
  
  if (!item || !item.priceAlerts) return [];
  
  const triggeredAlerts: IPriceAlert[] = [];
  
  item.priceAlerts.forEach(alert => {
    if (!alert.isActive || alert.isTriggered) return;
    
    let shouldTrigger = false;
    
    switch (alert.type) {
      case 'price_above':
        shouldTrigger = currentPrice > alert.value;
        break;
      case 'price_below':
        shouldTrigger = currentPrice < alert.value;
        break;
      case 'change_percent_above':
        shouldTrigger = changePercent !== undefined && changePercent > alert.value;
        break;
      case 'change_percent_below':
        shouldTrigger = changePercent !== undefined && changePercent < alert.value;
        break;
    }
    
    if (shouldTrigger) {
      alert.isTriggered = true;
      alert.triggeredAt = new Date();
      triggeredAlerts.push(alert);
    }
  });
  
  if (triggeredAlerts.length > 0) {
    this.updateMetadata();
  }
  
  return triggeredAlerts;
};

watchlistSchema.methods.addPriceAlert = function(symbol: string, alertData: Partial<IPriceAlert>) {
  const item = this.items.find((item: IWatchlistItem) => 
    item.symbol === symbol.toUpperCase()
  );
  
  if (!item) {
    throw new Error(`${symbol} not found in watchlist`);
  }
  
  if (!item.priceAlerts) item.priceAlerts = [];
  
  const newAlert = {
    ...alertData,
    isActive: true,
    isTriggered: false,
    notificationSent: false,
  } as IPriceAlert;
  
  item.priceAlerts.push(newAlert);
  this.updateMetadata();
  
  return this.save();
};

watchlistSchema.methods.updateMetadata = function() {
  const activeItems = this.items.filter((item: IWatchlistItem) => item.isActive);
  
  // Calculate total value
  this.metadata.totalValue = activeItems.reduce((sum, item) => {
    return sum + (item.currentPrice || item.addedPrice || 0);
  }, 0);
  
  // Calculate average change
  const itemsWithChange = activeItems.filter(item => item.priceChangePercent !== undefined);
  this.metadata.averageChange = itemsWithChange.length > 0 
    ? itemsWithChange.reduce((sum, item) => sum + (item.priceChangePercent || 0), 0) / itemsWithChange.length
    : 0;
  
  // Find top and worst performers
  if (itemsWithChange.length > 0) {
    const sortedByChange = itemsWithChange.sort((a, b) => (b.priceChangePercent || 0) - (a.priceChangePercent || 0));
    
    this.metadata.topPerformer = {
      symbol: sortedByChange[0].symbol,
      change: sortedByChange[0].priceChangePercent || 0,
    };
    
    this.metadata.worstPerformer = {
      symbol: sortedByChange[sortedByChange.length - 1].symbol,
      change: sortedByChange[sortedByChange.length - 1].priceChangePercent || 0,
    };
  }
  
  // Count alerts
  this.metadata.totalAlerts = activeItems.reduce((sum, item) => {
    return sum + (item.priceAlerts?.length || 0);
  }, 0);
  
  this.metadata.activeAlerts = activeItems.reduce((sum, item) => {
    return sum + (item.priceAlerts?.filter(alert => alert.isActive && !alert.isTriggered).length || 0);
  }, 0);
  
  // Calculate average price target
  const itemsWithTarget = activeItems.filter(item => item.targetPrice);
  this.metadata.avgPriceTarget = itemsWithTarget.length > 0
    ? itemsWithTarget.reduce((sum, item) => sum + (item.targetPrice || 0), 0) / itemsWithTarget.length
    : 0;
  
  // Analyze sectors
  const sectorCounts = new Map<string, number>();
  activeItems.forEach(item => {
    if (item.sector) {
      sectorCounts.set(item.sector, (sectorCounts.get(item.sector) || 0) + 1);
    }
  });
  
  this.metadata.sectorsRepresented = Array.from(sectorCounts.entries()).map(([sector, count]) => ({
    sector,
    count,
    percentage: (count / activeItems.length) * 100,
  }));
  
  this.metadata.lastFullUpdate = new Date();
};

watchlistSchema.methods.sortItems = function(sortBy?: string, sortOrder?: 'asc' | 'desc') {
  const sortField = sortBy || this.sortBy;
  const order = sortOrder || this.sortOrder;
  
  this.items.sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortField) {
      case 'symbol':
        aValue = a.symbol;
        bValue = b.symbol;
        break;
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'price':
        aValue = a.currentPrice || a.addedPrice || 0;
        bValue = b.currentPrice || b.addedPrice || 0;
        break;
      case 'change':
        aValue = a.priceChange || 0;
        bValue = b.priceChange || 0;
        break;
      case 'change_percent':
        aValue = a.priceChangePercent || 0;
        bValue = b.priceChangePercent || 0;
        break;
      case 'volume':
        aValue = a.performanceMetrics?.volume || 0;
        bValue = b.performanceMetrics?.volume || 0;
        break;
      case 'market_cap':
        aValue = a.performanceMetrics?.marketCap || 0;
        bValue = b.performanceMetrics?.marketCap || 0;
        break;
      case 'added_date':
        aValue = a.addedAt;
        bValue = b.addedAt;
        break;
      case 'priority':
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
        break;
      default:
        aValue = a.addedAt;
        bValue = b.addedAt;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return order === 'asc' ? comparison : -comparison;
    }
    
    const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    return order === 'asc' ? comparison : -comparison;
  });
  
  return this;
};

watchlistSchema.methods.clone = function(newName?: string, newUserId?: string) {
  const cloned = new (this.constructor as any)({
    ...this.toObject(),
    _id: undefined,
    userId: newUserId || this.userId,
    name: newName || `${this.name} (Copy)`,
    followers: [],
    followersCount: 0,
    isPublic: false,
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  return cloned;
};

// Static methods
watchlistSchema.statics.findByUser = function(userId: string, limit: number = 20) {
  return this.find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ isDefault: -1, createdAt: -1 })
    .limit(limit);
};

watchlistSchema.statics.findPublic = function(limit: number = 20, sortBy: 'popular' | 'recent' = 'popular') {
  const sort = sortBy === 'popular' 
    ? { followersCount: -1, createdAt: -1 }
    : { createdAt: -1 };
    
  return this.find({ isPublic: true })
    .sort(sort)
    .limit(limit)
    .populate('userId', 'username profileImage');
};

watchlistSchema.statics.findByType = function(type: string, userId?: string, limit: number = 20) {
  const query: any = { type };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  } else {
    query.isPublic = true;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

watchlistSchema.statics.findBySymbol = function(symbol: string, limit: number = 10) {
  return this.find({
    'items.symbol': symbol.toUpperCase(),
    isPublic: true,
  })
    .sort({ followersCount: -1 })
    .limit(limit)
    .populate('userId', 'username');
};

watchlistSchema.statics.searchPublic = function(query: string, limit: number = 20) {
  const searchRegex = new RegExp(query, 'i');
  
  return this.find({
    isPublic: true,
    $or: [
      { name: searchRegex },
      { description: searchRegex },
      { tags: searchRegex },
    ],
  })
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(limit)
    .populate('userId', 'username');
};

// Pre-save middleware
watchlistSchema.pre('save', function(next) {
  // Update metadata if items were modified
  if (this.isModified('items')) {
    this.updateMetadata();
  }
  
  // Auto-generate tags based on sectors and types
  if (this.isNew || this.isModified('items')) {
    const autoTags = [];
    
    // Add type as tag
    autoTags.push(this.type);
    
    // Add unique sectors as tags
    const sectors = [...new Set(this.items
      .filter(item => item.sector)
      .map(item => item.sector!.toLowerCase())
    )];
    
    autoTags.push(...sectors);
    
    this.tags = [...new Set([...this.tags, ...autoTags])];
  }
  
  next();
});

export const Watchlist = mongoose.model<IWatchlist>('Watchlist', watchlistSchema);
