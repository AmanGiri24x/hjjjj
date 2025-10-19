import mongoose, { Schema } from 'mongoose';
import { IPortfolio, IHolding, IPerformanceMetric, IRiskMetrics } from '../types';

const holdingSchema = new Schema<IHolding>({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
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
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  averageCost: {
    type: Number,
    required: true,
    min: 0,
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  marketValue: {
    type: Number,
    required: true,
    min: 0,
  },
  unrealizedGainLoss: {
    type: Number,
    required: true,
  },
  unrealizedGainLossPercentage: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  sector: String,
  exchange: String,
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

const performanceMetricSchema = new Schema<IPerformanceMetric>({
  date: {
    type: Date,
    required: true,
  },
  value: {
    type: Number,
    required: true,
    min: 0,
  },
  return1Day: {
    type: Number,
    required: true,
  },
  return7Day: {
    type: Number,
    required: true,
  },
  return30Day: {
    type: Number,
    required: true,
  },
  return90Day: {
    type: Number,
    required: true,
  },
  return1Year: {
    type: Number,
    required: true,
  },
  volatility: {
    type: Number,
    required: true,
    min: 0,
  },
  sharpeRatio: {
    type: Number,
    required: true,
  },
  beta: {
    type: Number,
    required: true,
  },
});

const riskMetricsSchema = new Schema<IRiskMetrics>({
  volatility: {
    type: Number,
    required: true,
    min: 0,
  },
  beta: {
    type: Number,
    required: true,
  },
  sharpeRatio: {
    type: Number,
    required: true,
  },
  maxDrawdown: {
    type: Number,
    required: true,
    max: 0,
  },
  valueAtRisk: {
    type: Number,
    required: true,
    max: 0,
  },
  conditionalValueAtRisk: {
    type: Number,
    required: true,
    max: 0,
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
  },
  diversificationRatio: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
});

const portfolioSchema = new Schema<IPortfolio>({
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
  totalValue: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  totalReturn: {
    type: Number,
    required: true,
    default: 0,
  },
  totalReturnPercentage: {
    type: Number,
    required: true,
    default: 0,
  },
  holdings: [holdingSchema],
  performance: [performanceMetricSchema],
  riskMetrics: {
    type: riskMetricsSchema,
    required: true,
    default: () => ({
      volatility: 0,
      beta: 1,
      sharpeRatio: 0,
      maxDrawdown: 0,
      valueAtRisk: 0,
      conditionalValueAtRisk: 0,
      riskScore: 5,
      diversificationRatio: 0,
    }),
  },
}, {
  timestamps: true,
});

// Indexes
portfolioSchema.index({ userId: 1, name: 1 }, { unique: true });
portfolioSchema.index({ 'holdings.symbol': 1 });
portfolioSchema.index({ totalValue: -1 });
portfolioSchema.index({ createdAt: -1 });

// Methods
portfolioSchema.methods.calculateTotalValue = function() {
  this.totalValue = this.holdings.reduce((sum: number, holding: IHolding) => {
    return sum + holding.marketValue;
  }, 0);
  return this.totalValue;
};

portfolioSchema.methods.calculateWeights = function() {
  const totalValue = this.calculateTotalValue();
  if (totalValue > 0) {
    this.holdings.forEach((holding: IHolding) => {
      holding.weight = (holding.marketValue / totalValue) * 100;
    });
  }
};

portfolioSchema.methods.updateHoldingPrices = async function(priceData: Record<string, number>) {
  this.holdings.forEach((holding: IHolding) => {
    if (priceData[holding.symbol]) {
      holding.currentPrice = priceData[holding.symbol];
      holding.marketValue = holding.quantity * holding.currentPrice;
      holding.unrealizedGainLoss = holding.marketValue - (holding.quantity * holding.averageCost);
      holding.unrealizedGainLossPercentage = ((holding.currentPrice - holding.averageCost) / holding.averageCost) * 100;
      holding.lastUpdated = new Date();
    }
  });
  
  this.calculateWeights();
  this.totalReturn = this.holdings.reduce((sum: number, holding: IHolding) => {
    return sum + holding.unrealizedGainLoss;
  }, 0);
  this.totalReturnPercentage = this.totalValue > 0 ? (this.totalReturn / (this.totalValue - this.totalReturn)) * 100 : 0;
};

// Pre-save middleware
portfolioSchema.pre('save', function(next) {
  this.calculateTotalValue();
  this.calculateWeights();
  next();
});

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', portfolioSchema);
