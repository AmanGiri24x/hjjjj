import mongoose, { Schema } from 'mongoose';
import { IMarketData, IPricePoint } from '../types';

const pricePointSchema = new Schema<IPricePoint>({
  timestamp: {
    type: Date,
    required: true,
  },
  open: {
    type: Number,
    required: true,
    min: 0,
  },
  high: {
    type: Number,
    required: true,
    min: 0,
  },
  low: {
    type: Number,
    required: true,
    min: 0,
  },
  close: {
    type: Number,
    required: true,
    min: 0,
  },
  volume: {
    type: Number,
    required: true,
    min: 0,
  },
  adjustedClose: {
    type: Number,
    min: 0,
  },
}, {
  _id: false,
});

const marketDataSchema = new Schema<IMarketData>({
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
    enum: ['stock', 'etf', 'crypto', 'bond', 'commodity', 'forex', 'option', 'future'],
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  previousClose: {
    type: Number,
    required: true,
    min: 0,
  },
  change: {
    type: Number,
    required: true,
  },
  changePercentage: {
    type: Number,
    required: true,
  },
  volume: {
    type: Number,
    required: true,
    min: 0,
  },
  marketCap: {
    type: Number,
    min: 0,
  },
  high52Week: {
    type: Number,
    required: true,
    min: 0,
  },
  low52Week: {
    type: Number,
    required: true,
    min: 0,
  },
  dividend: {
    type: Number,
    min: 0,
  },
  dividendYield: {
    type: Number,
    min: 0,
  },
  pe: {
    type: Number,
    min: 0,
  },
  eps: {
    type: Number,
  },
  beta: {
    type: Number,
  },
  sector: {
    type: String,
    trim: true,
    index: true,
  },
  exchange: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD',
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  priceHistory: [pricePointSchema],
}, {
  timestamps: true,
});

// Indexes for optimal query performance
marketDataSchema.index({ symbol: 1, timestamp: -1 });
marketDataSchema.index({ type: 1, sector: 1 });
marketDataSchema.index({ exchange: 1, type: 1 });
marketDataSchema.index({ changePercentage: -1 });
marketDataSchema.index({ volume: -1 });
marketDataSchema.index({ marketCap: -1 });
marketDataSchema.index({ createdAt: -1 });

// Compound index for trending stocks
marketDataSchema.index({ 
  type: 1, 
  changePercentage: -1, 
  volume: -1,
  timestamp: -1 
});

// Methods
marketDataSchema.methods.calculateChange = function() {
  this.change = this.price - this.previousClose;
  this.changePercentage = this.previousClose > 0 
    ? ((this.change / this.previousClose) * 100) 
    : 0;
};

marketDataSchema.methods.addPricePoint = function(pricePoint: IPricePoint) {
  this.priceHistory.push(pricePoint);
  
  // Keep only last 365 days of price history
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  this.priceHistory = this.priceHistory.filter(
    point => point.timestamp >= oneYearAgo
  );
  
  // Sort by timestamp descending
  this.priceHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

marketDataSchema.methods.getRecentPrices = function(days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.priceHistory
    .filter(point => point.timestamp >= cutoffDate)
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
};

marketDataSchema.methods.calculateVolatility = function(days: number = 30): number {
  const recentPrices = this.getRecentPrices(days);
  
  if (recentPrices.length < 2) return 0;
  
  const returns = [];
  for (let i = 1; i < recentPrices.length; i++) {
    const dailyReturn = (recentPrices[i].close - recentPrices[i - 1].close) / recentPrices[i - 1].close;
    returns.push(dailyReturn);
  }
  
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const squaredDifferences = returns.map(ret => Math.pow(ret - meanReturn, 2));
  const variance = squaredDifferences.reduce((sum, diff) => sum + diff, 0) / (returns.length - 1);
  
  return Math.sqrt(variance * 252); // Annualized volatility
};

// Static methods
marketDataSchema.statics.findBySymbol = function(symbol: string) {
  return this.findOne({ symbol: symbol.toUpperCase() });
};

marketDataSchema.statics.findTrendingStocks = function(limit: number = 10) {
  return this.find({ type: 'stock' })
    .sort({ changePercentage: -1, volume: -1 })
    .limit(limit);
};

marketDataSchema.statics.findTopGainers = function(limit: number = 10) {
  return this.find({ changePercentage: { $gt: 0 } })
    .sort({ changePercentage: -1 })
    .limit(limit);
};

marketDataSchema.statics.findTopLosers = function(limit: number = 10) {
  return this.find({ changePercentage: { $lt: 0 } })
    .sort({ changePercentage: 1 })
    .limit(limit);
};

marketDataSchema.statics.findBySector = function(sector: string, limit: number = 20) {
  return this.find({ sector: new RegExp(sector, 'i') })
    .sort({ marketCap: -1 })
    .limit(limit);
};

// Pre-save middleware
marketDataSchema.pre('save', function(next) {
  this.calculateChange();
  this.timestamp = new Date();
  next();
});

// TTL index for automatic cleanup of old data (30 days)
marketDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const MarketData = mongoose.model<IMarketData>('MarketData', marketDataSchema);
