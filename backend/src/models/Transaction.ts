import mongoose, { Schema } from 'mongoose';
import { ITransaction, IExecutionDetails, IFeeStructure } from '../types';

const feeStructureSchema = new Schema<IFeeStructure>({
  brokerage: {
    type: Number,
    min: 0,
    default: 0,
  },
  exchangeFee: {
    type: Number,
    min: 0,
    default: 0,
  },
  clearingFee: {
    type: Number,
    min: 0,
    default: 0,
  },
  regulatoryFee: {
    type: Number,
    min: 0,
    default: 0,
  },
  gst: {
    type: Number,
    min: 0,
    default: 0,
  },
  stampDuty: {
    type: Number,
    min: 0,
    default: 0,
  },
  transactionCharge: {
    type: Number,
    min: 0,
    default: 0,
  },
  totalFees: {
    type: Number,
    min: 0,
    required: true,
  },
}, {
  _id: false,
});

const executionDetailsSchema = new Schema<IExecutionDetails>({
  executionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  executedAt: {
    type: Date,
    required: true,
    index: true,
  },
  executedPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  executedQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  remainingQuantity: {
    type: Number,
    required: true,
    min: 0,
  },
  marketPrice: {
    type: Number,
    min: 0,
  },
  slippage: {
    type: Number, // Difference between expected and actual execution price
  },
  venue: {
    type: String, // Exchange or venue where trade was executed
    required: true,
  },
  liquidity: {
    type: String,
    enum: ['maker', 'taker', 'unknown'],
    default: 'unknown',
  },
}, {
  _id: false,
});

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  portfolioId: {
    type: Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
    index: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true,
  },
  symbolName: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['buy', 'sell', 'dividend', 'split', 'merger', 'bonus', 'rights', 'ipo'],
    required: true,
    index: true,
  },
  orderType: {
    type: String,
    enum: ['market', 'limit', 'stop_loss', 'stop_limit', 'bracket', 'cover', 'iceberg'],
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stopPrice: {
    type: Number,
    min: 0,
  },
  limitPrice: {
    type: Number,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  fees: feeStructureSchema,
  netAmount: {
    type: Number,
    required: true, // Total amount + fees for buy, Total amount - fees for sell
  },
  status: {
    type: String,
    enum: ['pending', 'partially_filled', 'filled', 'cancelled', 'rejected', 'expired'],
    required: true,
    default: 'pending',
    index: true,
  },
  executionDetails: [executionDetailsSchema],
  source: {
    type: String,
    enum: ['manual', 'algorithmic', 'ai_recommended', 'alert_triggered', 'rebalancing', 'dca'],
    required: true,
    default: 'manual',
    index: true,
  },
  broker: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brokerId: {
      type: String,
      trim: true,
    },
    apiKey: {
      type: String,
      select: false, // Don't include in queries by default
    },
  },
  exchange: {
    type: String,
    required: true,
    uppercase: true,
    index: true,
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    default: 'USD',
  },
  validTill: {
    type: Date,
    index: true,
  },
  parentOrderId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
    index: true,
  },
  childOrderIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  }],
  notes: {
    type: String,
    maxlength: 1000,
  },
  metadata: {
    aiInsightId: {
      type: Schema.Types.ObjectId,
      ref: 'AIInsights',
    },
    alertId: {
      type: Schema.Types.ObjectId,
      ref: 'Alert',
    },
    strategy: {
      type: String,
      trim: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    expectedReturn: {
      type: Number,
    },
    timeHorizon: {
      type: String,
      enum: ['intraday', 'short_term', 'medium_term', 'long_term'],
    },
    sentiment: {
      type: String,
      enum: ['very_bearish', 'bearish', 'neutral', 'bullish', 'very_bullish'],
    },
    marketConditions: {
      regime: {
        type: String,
        enum: ['bull_market', 'bear_market', 'sideways', 'volatile'],
      },
      volatility: Number,
      trend: {
        type: String,
        enum: ['uptrend', 'downtrend', 'sideways'],
      },
    },
    performance: {
      unrealizedPnL: {
        type: Number,
        default: 0,
      },
      realizedPnL: {
        type: Number,
        default: 0,
      },
      holdingPeriod: {
        type: Number, // in days
        min: 0,
      },
      returnPercentage: {
        type: Number,
      },
    },
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  isSimulated: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for optimal query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ portfolioId: 1, symbol: 1, createdAt: -1 });
transactionSchema.index({ symbol: 1, type: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ source: 1, createdAt: -1 });
transactionSchema.index({ exchange: 1, currency: 1, createdAt: -1 });
transactionSchema.index({ validTill: 1, status: 1 });
transactionSchema.index({ 'executionDetails.executedAt': -1 });
transactionSchema.index({ isSimulated: 1, userId: 1, createdAt: -1 });

// Compound indexes for complex queries
transactionSchema.index({
  userId: 1,
  symbol: 1,
  type: 1,
  status: 1,
  createdAt: -1,
});

transactionSchema.index({
  portfolioId: 1,
  status: 1,
  isActive: 1,
  createdAt: -1,
});

transactionSchema.index({
  userId: 1,
  source: 1,
  type: 1,
  createdAt: -1,
});

// Methods
transactionSchema.methods.isPending = function(): boolean {
  return this.status === 'pending' || this.status === 'partially_filled';
};

transactionSchema.methods.isCompleted = function(): boolean {
  return this.status === 'filled';
};

transactionSchema.methods.isCancellable = function(): boolean {
  return ['pending', 'partially_filled'].includes(this.status) && 
         (!this.validTill || this.validTill > new Date());
};

transactionSchema.methods.isExpired = function(): boolean {
  return this.validTill && this.validTill <= new Date();
};

transactionSchema.methods.calculateTotalFees = function() {
  if (!this.fees) return 0;
  
  return (this.fees.brokerage || 0) +
         (this.fees.exchangeFee || 0) +
         (this.fees.clearingFee || 0) +
         (this.fees.regulatoryFee || 0) +
         (this.fees.gst || 0) +
         (this.fees.stampDuty || 0) +
         (this.fees.transactionCharge || 0);
};

transactionSchema.methods.calculateNetAmount = function() {
  const totalFees = this.calculateTotalFees();
  
  if (this.type === 'buy') {
    this.netAmount = this.totalAmount + totalFees;
  } else if (this.type === 'sell') {
    this.netAmount = this.totalAmount - totalFees;
  } else {
    this.netAmount = this.totalAmount; // For dividends, splits, etc.
  }
  
  return this.netAmount;
};

transactionSchema.methods.getAverageExecutionPrice = function(): number {
  if (!this.executionDetails || this.executionDetails.length === 0) {
    return this.price;
  }
  
  let totalValue = 0;
  let totalQuantity = 0;
  
  this.executionDetails.forEach(execution => {
    totalValue += execution.executedPrice * execution.executedQuantity;
    totalQuantity += execution.executedQuantity;
  });
  
  return totalQuantity > 0 ? totalValue / totalQuantity : this.price;
};

transactionSchema.methods.getExecutedQuantity = function(): number {
  if (!this.executionDetails || this.executionDetails.length === 0) {
    return this.status === 'filled' ? this.quantity : 0;
  }
  
  return this.executionDetails.reduce((sum, execution) => {
    return sum + execution.executedQuantity;
  }, 0);
};

transactionSchema.methods.getRemainingQuantity = function(): number {
  return this.quantity - this.getExecutedQuantity();
};

transactionSchema.methods.addExecution = function(executionData: Partial<IExecutionDetails>) {
  const execution = {
    ...executionData,
    executionId: executionData.executionId || `exec_${Date.now()}_${Math.random()}`,
    executedAt: executionData.executedAt || new Date(),
  } as IExecutionDetails;
  
  this.executionDetails.push(execution);
  
  const executedQty = this.getExecutedQuantity();
  const remainingQty = this.getRemainingQuantity();
  
  if (remainingQty <= 0) {
    this.status = 'filled';
  } else if (executedQty > 0) {
    this.status = 'partially_filled';
  }
  
  return this.save();
};

transactionSchema.methods.cancel = function(reason?: string) {
  if (!this.isCancellable()) {
    throw new Error('Transaction cannot be cancelled');
  }
  
  this.status = 'cancelled';
  this.isActive = false;
  
  if (reason) {
    this.notes = this.notes ? `${this.notes}\nCancelled: ${reason}` : `Cancelled: ${reason}`;
  }
  
  return this.save();
};

transactionSchema.methods.updatePerformance = function(currentPrice: number) {
  if (!this.isCompleted() || this.type !== 'buy') return;
  
  const executedPrice = this.getAverageExecutionPrice();
  const executedQty = this.getExecutedQuantity();
  
  // Calculate unrealized P&L for buy transactions
  this.metadata.performance.unrealizedPnL = (currentPrice - executedPrice) * executedQty;
  this.metadata.performance.returnPercentage = ((currentPrice - executedPrice) / executedPrice) * 100;
  
  // Calculate holding period
  const firstExecution = this.executionDetails.sort((a, b) => 
    a.executedAt.getTime() - b.executedAt.getTime()
  )[0];
  
  if (firstExecution) {
    const holdingDays = (Date.now() - firstExecution.executedAt.getTime()) / (1000 * 60 * 60 * 24);
    this.metadata.performance.holdingPeriod = Math.round(holdingDays);
  }
};

transactionSchema.methods.clone = function(modifications: any = {}) {
  const cloned = new (this.constructor as any)({
    ...this.toObject(),
    _id: undefined,
    ...modifications,
    status: 'pending',
    executionDetails: [],
    triggeredCount: 0,
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  return cloned;
};

// Static methods
transactionSchema.statics.findByUser = function(userId: string, limit: number = 50) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('portfolioId', 'name')
    .populate('metadata.aiInsightId', 'recommendation confidence')
    .populate('metadata.alertId', 'name type');
};

transactionSchema.statics.findByPortfolio = function(portfolioId: string, limit: number = 50) {
  return this.find({
    portfolioId: new mongoose.Types.ObjectId(portfolioId),
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

transactionSchema.statics.findBySymbol = function(symbol: string, userId?: string, limit: number = 50) {
  const query: any = {
    symbol: symbol.toUpperCase(),
    isActive: true,
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

transactionSchema.statics.findPendingOrders = function(userId?: string, limit: number = 50) {
  const query: any = {
    status: { $in: ['pending', 'partially_filled'] },
    isActive: true,
    $or: [
      { validTill: { $exists: false } },
      { validTill: { $gt: new Date() } },
    ],
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

transactionSchema.statics.findByStatus = function(status: string, userId?: string, limit: number = 50) {
  const query: any = {
    status,
    isActive: true,
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

transactionSchema.statics.findBySource = function(source: string, userId?: string, limit: number = 50) {
  const query: any = {
    source,
    isActive: true,
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit);
};

transactionSchema.statics.getPortfolioTransactionStats = function(portfolioId: string, days: number = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        portfolioId: new mongoose.Types.ObjectId(portfolioId),
        createdAt: { $gte: cutoff },
        isActive: true,
      }
    },
    {
      $group: {
        _id: null,
        totalTransactions: { $sum: 1 },
        totalVolume: { $sum: '$totalAmount' },
        totalFees: { $sum: '$fees.totalFees' },
        buyTransactions: {
          $sum: { $cond: [{ $eq: ['$type', 'buy'] }, 1, 0] }
        },
        sellTransactions: {
          $sum: { $cond: [{ $eq: ['$type', 'sell'] }, 1, 0] }
        },
        avgTransactionSize: { $avg: '$totalAmount' },
        uniqueSymbols: { $addToSet: '$symbol' },
        completedTransactions: {
          $sum: { $cond: [{ $eq: ['$status', 'filled'] }, 1, 0] }
        },
        pendingTransactions: {
          $sum: { $cond: [{ $in: ['$status', ['pending', 'partially_filled']] }, 1, 0] }
        },
      }
    },
    {
      $project: {
        totalTransactions: 1,
        totalVolume: 1,
        totalFees: 1,
        buyTransactions: 1,
        sellTransactions: 1,
        avgTransactionSize: 1,
        uniqueSymbolsCount: { $size: '$uniqueSymbols' },
        completedTransactions: 1,
        pendingTransactions: 1,
        completionRate: {
          $multiply: [
            { $divide: ['$completedTransactions', '$totalTransactions'] },
            100
          ]
        },
      }
    }
  ]);
};

transactionSchema.statics.getUserTradingStats = function(userId: string, days: number = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: cutoff },
        status: 'filled',
        isActive: true,
      }
    },
    {
      $group: {
        _id: null,
        totalTrades: { $sum: 1 },
        totalVolume: { $sum: '$totalAmount' },
        totalFees: { $sum: '$fees.totalFees' },
        totalPnL: { $sum: '$metadata.performance.realizedPnL' },
        avgHoldingPeriod: { $avg: '$metadata.performance.holdingPeriod' },
        winningTrades: {
          $sum: { $cond: [{ $gt: ['$metadata.performance.realizedPnL', 0] }, 1, 0] }
        },
        losingTrades: {
          $sum: { $cond: [{ $lt: ['$metadata.performance.realizedPnL', 0] }, 1, 0] }
        },
        tradesBySource: {
          $push: '$source'
        },
        avgTradeSize: { $avg: '$totalAmount' },
      }
    },
    {
      $project: {
        totalTrades: 1,
        totalVolume: 1,
        totalFees: 1,
        totalPnL: 1,
        avgHoldingPeriod: 1,
        winningTrades: 1,
        losingTrades: 1,
        winRate: {
          $multiply: [
            { $divide: ['$winningTrades', '$totalTrades'] },
            100
          ]
        },
        avgTradeSize: 1,
        netPnL: { $subtract: ['$totalPnL', '$totalFees'] },
      }
    }
  ]);
};

// Pre-save middleware
transactionSchema.pre('save', function(next) {
  // Calculate fees and net amount
  if (this.isModified('fees') || this.isModified('totalAmount')) {
    this.fees.totalFees = this.calculateTotalFees();
    this.calculateNetAmount();
  }
  
  // Auto-generate tags based on transaction properties
  if (this.isNew) {
    const autoTags = [];
    
    autoTags.push(this.type);
    autoTags.push(this.orderType);
    autoTags.push(this.source);
    
    if (this.metadata.timeHorizon) autoTags.push(this.metadata.timeHorizon);
    if (this.metadata.strategy) autoTags.push(this.metadata.strategy.toLowerCase());
    
    this.tags = [...new Set([...this.tags, ...autoTags])];
  }
  
  // Check if order has expired
  if (this.isExpired() && this.isPending()) {
    this.status = 'expired';
    this.isActive = false;
  }
  
  next();
});

// TTL index for automatic cleanup of old expired transactions
transactionSchema.index({ validTill: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { 
    status: { $in: ['expired', 'cancelled'] },
    isActive: false 
  }
});

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
