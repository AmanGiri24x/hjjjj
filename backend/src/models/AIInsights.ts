import mongoose, { Schema } from 'mongoose';
import { IAIInsights, IPrediction, IRecommendation, IModelMetrics } from '../types';

const modelMetricsSchema = new Schema<IModelMetrics>({
  accuracy: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  precision: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  recall: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  f1Score: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  sharpeRatio: {
    type: Number,
  },
  maxDrawdown: {
    type: Number,
    min: 0,
    max: 1,
  },
  winRate: {
    type: Number,
    min: 0,
    max: 1,
  },
  avgReturn: {
    type: Number,
  },
  volatility: {
    type: Number,
    min: 0,
  },
  beta: {
    type: Number,
  },
}, {
  _id: false,
});

const predictionSchema = new Schema<IPrediction>({
  type: {
    type: String,
    enum: ['price_target', 'direction', 'volatility', 'support_resistance', 'pattern', 'momentum'],
    required: true,
  },
  timeframe: {
    type: String,
    enum: ['1h', '4h', '1d', '1w', '1m', '3m', '6m', '1y'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
  },
  probability: {
    type: Number,
    min: 0,
    max: 1,
  },
  range: {
    min: {
      type: Number,
      required: true,
    },
    max: {
      type: Number,
      required: true,
    },
  },
  reasoning: {
    type: String,
    maxlength: 1000,
  },
  technicalIndicators: [{
    name: {
      type: String,
      enum: ['RSI', 'MACD', 'SMA', 'EMA', 'BB', 'STOCH', 'ADX', 'CCI', 'WR', 'ROC'],
    },
    value: Number,
    signal: {
      type: String,
      enum: ['bullish', 'bearish', 'neutral'],
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
  fundamentalFactors: [{
    factor: {
      type: String,
      enum: ['earnings', 'revenue', 'debt_ratio', 'pe_ratio', 'market_cap', 'dividend_yield'],
    },
    impact: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
    weight: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
}, {
  _id: false,
});

const recommendationSchema = new Schema<IRecommendation>({
  action: {
    type: String,
    enum: ['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'],
    required: true,
  },
  targetPrice: {
    type: Number,
    min: 0,
  },
  stopLoss: {
    type: Number,
    min: 0,
  },
  riskLevel: {
    type: String,
    enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    required: true,
  },
  timeHorizon: {
    type: String,
    enum: ['short_term', 'medium_term', 'long_term'],
    required: true,
  },
  expectedReturn: {
    type: Number,
  },
  maxLoss: {
    type: Number,
    min: 0,
    max: 1,
  },
  portfolio_allocation: {
    type: Number,
    min: 0,
    max: 1,
  },
  reasoning: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  catalysts: [{
    event: String,
    impact: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
    },
    probability: {
      type: Number,
      min: 0,
      max: 1,
    },
    timeframe: String,
  }],
  risks: [{
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    probability: {
      type: Number,
      min: 0,
      max: 1,
    },
    mitigation: String,
  }],
}, {
  _id: false,
});

const aiInsightsSchema = new Schema<IAIInsights>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
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
    enum: ['individual_stock', 'portfolio', 'sector', 'market', 'crypto', 'commodity'],
    required: true,
    index: true,
  },
  modelName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  modelVersion: {
    type: String,
    required: true,
    default: '1.0.0',
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    required: true,
    index: true,
  },
  predictions: [predictionSchema],
  recommendation: recommendationSchema,
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      required: true,
    },
    label: {
      type: String,
      enum: ['very_bearish', 'bearish', 'neutral', 'bullish', 'very_bullish'],
      required: true,
    },
    factors: [{
      source: {
        type: String,
        enum: ['news', 'social_media', 'analyst_reports', 'earnings', 'technical'],
      },
      weight: Number,
      sentiment: Number,
    }],
  },
  marketRegime: {
    type: String,
    enum: ['bull_market', 'bear_market', 'sideways', 'volatile', 'trending'],
    index: true,
  },
  correlations: [{
    symbol: {
      type: String,
      uppercase: true,
    },
    correlation: {
      type: Number,
      min: -1,
      max: 1,
    },
    significance: {
      type: String,
      enum: ['very_low', 'low', 'medium', 'high', 'very_high'],
    },
  }],
  seasonality: [{
    period: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
    },
    pattern: String,
    strength: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
  riskMetrics: {
    var: {
      type: Number, // Value at Risk
    },
    cvar: {
      type: Number, // Conditional Value at Risk
    },
    maxDrawdown: {
      type: Number,
      min: 0,
      max: 1,
    },
    volatility: {
      type: Number,
      min: 0,
    },
    beta: {
      type: Number,
    },
    sharpeRatio: {
      type: Number,
    },
    sortinoRatio: {
      type: Number,
    },
  },
  modelMetrics: modelMetricsSchema,
  dataQuality: {
    score: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    completeness: {
      type: Number,
      min: 0,
      max: 1,
    },
    freshness: {
      type: Number,
      min: 0,
      max: 1,
    },
    consistency: {
      type: Number,
      min: 0,
      max: 1,
    },
    issues: [String],
  },
  executionTime: {
    type: Number, // in milliseconds
    required: true,
  },
  dataSource: [{
    type: {
      type: String,
      enum: ['market_data', 'news', 'social_media', 'earnings', 'economic_indicators'],
    },
    provider: String,
    lastUpdate: Date,
    quality: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
  validUntil: {
    type: Date,
    required: true,
    index: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  }],
  metadata: {
    features_used: [String],
    training_period: {
      start: Date,
      end: Date,
    },
    lookback_days: Number,
    prediction_horizon: Number,
    model_parameters: Schema.Types.Mixed,
    feature_importance: [{
      feature: String,
      importance: {
        type: Number,
        min: 0,
        max: 1,
      },
    }],
  },
}, {
  timestamps: true,
});

// Indexes for optimal query performance
aiInsightsSchema.index({ symbol: 1, createdAt: -1 });
aiInsightsSchema.index({ userId: 1, symbol: 1, createdAt: -1 });
aiInsightsSchema.index({ type: 1, modelName: 1, createdAt: -1 });
aiInsightsSchema.index({ confidence: -1, createdAt: -1 });
aiInsightsSchema.index({ 'recommendation.action': 1, createdAt: -1 });
aiInsightsSchema.index({ validUntil: 1, isActive: 1 });
aiInsightsSchema.index({ marketRegime: 1, createdAt: -1 });
aiInsightsSchema.index({ 'sentiment.label': 1, createdAt: -1 });
aiInsightsSchema.index({ tags: 1, createdAt: -1 });

// Compound indexes for complex queries
aiInsightsSchema.index({
  symbol: 1,
  'recommendation.action': 1,
  confidence: -1,
  createdAt: -1,
});

aiInsightsSchema.index({
  userId: 1,
  type: 1,
  isActive: 1,
  createdAt: -1,
});

// Methods
aiInsightsSchema.methods.isValid = function(): boolean {
  return this.isActive && this.validUntil > new Date();
};

aiInsightsSchema.methods.getHighConfidencePredictions = function(minConfidence: number = 0.7) {
  return this.predictions.filter((pred: IPrediction) => pred.confidence >= minConfidence);
};

aiInsightsSchema.methods.getPredictionByType = function(type: string, timeframe?: string) {
  return this.predictions.find((pred: IPrediction) => 
    pred.type === type && (!timeframe || pred.timeframe === timeframe)
  );
};

aiInsightsSchema.methods.calculateOverallRiskScore = function(): number {
  const riskWeights = {
    very_low: 0.1,
    low: 0.3,
    medium: 0.5,
    high: 0.7,
    very_high: 0.9,
  };
  
  return riskWeights[this.recommendation.riskLevel] || 0.5;
};

aiInsightsSchema.methods.getActionScore = function(): number {
  const actionScores = {
    strong_sell: -2,
    sell: -1,
    hold: 0,
    buy: 1,
    strong_buy: 2,
  };
  
  return actionScores[this.recommendation.action] || 0;
};

aiInsightsSchema.methods.updateValidation = function(actualPrice: number, actualDate: Date) {
  // Update model performance based on actual outcomes
  const predictions = this.getHighConfidencePredictions();
  
  for (const prediction of predictions) {
    if (prediction.type === 'price_target') {
      const error = Math.abs(actualPrice - prediction.value) / prediction.value;
      const isWithinRange = actualPrice >= prediction.range.min && actualPrice <= prediction.range.max;
      
      // Store validation results (could be expanded to a separate collection)
      this.metadata.validation = {
        actual_price: actualPrice,
        predicted_price: prediction.value,
        error_percentage: error * 100,
        within_range: isWithinRange,
        validated_at: actualDate,
      };
    }
  }
};

aiInsightsSchema.methods.expire = function() {
  this.isActive = false;
  this.validUntil = new Date();
  return this.save();
};

// Static methods
aiInsightsSchema.statics.findBySymbol = function(symbol: string, limit: number = 10) {
  return this.find({ 
    symbol: symbol.toUpperCase(), 
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.findByAction = function(action: string, limit: number = 20) {
  return this.find({ 
    'recommendation.action': action,
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ confidence: -1, createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.findHighConfidence = function(minConfidence: number = 0.8, limit: number = 20) {
  return this.find({
    confidence: { $gte: minConfidence },
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ confidence: -1, createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.findByMarketRegime = function(regime: string, limit: number = 20) {
  return this.find({
    marketRegime: regime,
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.findBySentiment = function(sentiment: string, limit: number = 20) {
  return this.find({
    'sentiment.label': sentiment,
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ 'sentiment.score': sentiment.includes('bullish') ? -1 : 1, createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.findPortfolioInsights = function(userId: string, limit: number = 10) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    type: { $in: ['portfolio', 'individual_stock'] },
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ confidence: -1, createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.findByModel = function(modelName: string, limit: number = 20) {
  return this.find({
    modelName,
    isActive: true,
    validUntil: { $gt: new Date() }
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

aiInsightsSchema.statics.getModelPerformance = function(modelName: string, days: number = 30) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        modelName,
        createdAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: '$modelName',
        avgConfidence: { $avg: '$confidence' },
        avgAccuracy: { $avg: '$modelMetrics.accuracy' },
        avgSharpeRatio: { $avg: '$modelMetrics.sharpeRatio' },
        totalPredictions: { $sum: 1 },
        avgExecutionTime: { $avg: '$executionTime' }
      }
    }
  ]);
};

// Pre-save middleware
aiInsightsSchema.pre('save', function(next) {
  // Set default valid until time if not provided
  if (!this.validUntil) {
    const defaultValidHours = {
      '1h': 1,
      '4h': 4,
      '1d': 24,
      '1w': 168, // 7 days
      '1m': 720, // 30 days
      '3m': 2160, // 90 days
      '6m': 4320, // 180 days
      '1y': 8760, // 365 days
    };
    
    // Find the longest timeframe prediction
    const maxTimeframe = this.predictions.reduce((max, pred) => {
      const hours = defaultValidHours[pred.timeframe] || 24;
      return hours > (defaultValidHours[max] || 0) ? pred.timeframe : max;
    }, '1d');
    
    const validHours = defaultValidHours[maxTimeframe] || 24;
    this.validUntil = new Date(Date.now() + validHours * 60 * 60 * 1000);
  }
  
  // Auto-generate tags based on content
  if (this.isNew) {
    const autoTags = [];
    
    if (this.confidence >= 0.9) autoTags.push('high_confidence');
    if (this.confidence <= 0.5) autoTags.push('low_confidence');
    
    if (this.recommendation.action.includes('buy')) autoTags.push('bullish');
    if (this.recommendation.action.includes('sell')) autoTags.push('bearish');
    
    if (this.recommendation.riskLevel === 'very_high') autoTags.push('high_risk');
    if (this.recommendation.riskLevel === 'very_low') autoTags.push('low_risk');
    
    this.tags = [...new Set([...this.tags, ...autoTags])];
  }
  
  next();
});

// TTL index for automatic cleanup of expired insights
aiInsightsSchema.index({ validUntil: 1 }, { expireAfterSeconds: 0 });

export const AIInsights = mongoose.model<IAIInsights>('AIInsights', aiInsightsSchema);
