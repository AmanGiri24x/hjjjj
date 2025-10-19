import mongoose, { Schema } from 'mongoose';
import { IAlert, IAlertCondition, IAlertDelivery } from '../types';

const alertConditionSchema = new Schema<IAlertCondition>({
  type: {
    type: String,
    enum: [
      'price_above',
      'price_below',
      'price_change_percent',
      'volume_above',
      'volume_below',
      'market_cap_above',
      'market_cap_below',
      'rsi_above',
      'rsi_below',
      'moving_average_cross',
      'support_resistance_break',
      'pattern_detected',
      'news_sentiment',
      'ai_recommendation_change',
      'earnings_announcement',
      'dividend_announcement',
    ],
    required: true,
  },
  operator: {
    type: String,
    enum: ['greater_than', 'less_than', 'equals', 'not_equals', 'between', 'outside_range'],
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  secondValue: {
    type: Number, // For 'between' and 'outside_range' operators
  },
  timeframe: {
    type: String,
    enum: ['1m', '5m', '15m', '1h', '4h', '1d', '1w'],
    default: '1d',
  },
  comparison: {
    type: String,
    enum: ['absolute', 'percentage', 'relative_to_average'],
    default: 'absolute',
  },
  lookbackPeriod: {
    type: Number,
    default: 1, // Number of periods to look back
  },
  metadata: {
    indicator_settings: Schema.Types.Mixed,
    pattern_type: String,
    sentiment_threshold: Number,
  },
}, {
  _id: false,
});

const alertDeliverySchema = new Schema<IAlertDelivery>({
  method: {
    type: String,
    enum: ['email', 'sms', 'push_notification', 'webhook', 'in_app'],
    required: true,
  },
  destination: {
    type: String,
    required: true,
    validate: {
      validator: function(v: string) {
        const method = this.parent().method;
        
        switch (method) {
          case 'email':
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
          case 'sms':
            return /^\+?[\d\s-()]+$/.test(v);
          case 'webhook':
            return /^https?:\/\/.+/.test(v);
          case 'push_notification':
          case 'in_app':
            return mongoose.Types.ObjectId.isValid(v);
          default:
            return true;
        }
      },
      message: 'Invalid destination format for selected delivery method',
    },
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  throttle: {
    enabled: {
      type: Boolean,
      default: false,
    },
    interval: {
      type: Number, // in minutes
      default: 60,
    },
    maxPerDay: {
      type: Number,
      default: 10,
    },
  },
  template: {
    subject: String,
    body: String,
    variables: Schema.Types.Mixed,
  },
}, {
  _id: false,
});

const alertSchema = new Schema<IAlert>({
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
    enum: ['price', 'technical', 'fundamental', 'news', 'ai_insight', 'portfolio'],
    required: true,
    index: true,
  },
  conditions: [alertConditionSchema],
  logicalOperator: {
    type: String,
    enum: ['AND', 'OR'],
    default: 'AND',
  },
  delivery: [alertDeliverySchema],
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'always'],
    default: 'once',
  },
  expiresAt: {
    type: Date,
    index: true,
  },
  triggeredCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastTriggered: {
    type: Date,
    index: true,
  },
  lastChecked: {
    type: Date,
    default: Date.now,
  },
  nextCheck: {
    type: Date,
    index: true,
  },
  checkInterval: {
    type: Number, // in minutes
    default: 5,
    min: 1,
    max: 1440, // max 24 hours
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  }],
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'ai_generated', 'template', 'imported'],
      default: 'manual',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    estimatedTriggerProbability: {
      type: Number,
      min: 0,
      max: 1,
    },
    relatedAlerts: [{
      type: Schema.Types.ObjectId,
      ref: 'Alert',
    }],
    performance: {
      totalTriggers: {
        type: Number,
        default: 0,
      },
      falseTriggers: {
        type: Number,
        default: 0,
      },
      avgResponseTime: Number, // in milliseconds
      lastPerformanceUpdate: Date,
    },
  },
  webhookConfig: {
    url: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Webhook URL must be a valid HTTP/HTTPS URL',
      },
    },
    headers: Schema.Types.Mixed,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH'],
      default: 'POST',
    },
    payload: Schema.Types.Mixed,
    retryConfig: {
      maxRetries: {
        type: Number,
        default: 3,
        min: 0,
        max: 10,
      },
      retryDelay: {
        type: Number,
        default: 1000, // in milliseconds
        min: 100,
      },
      backoffFactor: {
        type: Number,
        default: 2,
        min: 1,
      },
    },
  },
}, {
  timestamps: true,
});

// Indexes for optimal query performance
alertSchema.index({ userId: 1, isActive: 1, createdAt: -1 });
alertSchema.index({ symbol: 1, type: 1, isActive: 1 });
alertSchema.index({ isActive: 1, nextCheck: 1 });
alertSchema.index({ expiresAt: 1 });
alertSchema.index({ lastTriggered: -1 });
alertSchema.index({ priority: 1, isActive: 1 });
alertSchema.index({ tags: 1, userId: 1 });
alertSchema.index({ 'conditions.type': 1, isActive: 1 });

// Compound indexes for complex queries
alertSchema.index({
  userId: 1,
  symbol: 1,
  isActive: 1,
  createdAt: -1,
});

alertSchema.index({
  isActive: 1,
  nextCheck: 1,
  checkInterval: 1,
});

// Methods
alertSchema.methods.isExpired = function(): boolean {
  return this.expiresAt && this.expiresAt <= new Date();
};

alertSchema.methods.shouldCheck = function(): boolean {
  if (!this.isActive || this.isExpired()) return false;
  return !this.nextCheck || this.nextCheck <= new Date();
};

alertSchema.methods.updateNextCheck = function() {
  this.lastChecked = new Date();
  this.nextCheck = new Date(Date.now() + this.checkInterval * 60 * 1000);
};

alertSchema.methods.trigger = function(data?: any) {
  this.triggeredCount += 1;
  this.lastTriggered = new Date();
  
  // Update performance metrics
  this.metadata.performance.totalTriggers += 1;
  this.metadata.performance.lastPerformanceUpdate = new Date();
  
  // Handle frequency-based behavior
  if (this.frequency === 'once') {
    this.isActive = false;
  }
  
  this.updateNextCheck();
  
  // Return trigger data for processing
  return {
    alertId: this._id,
    userId: this.userId,
    symbol: this.symbol,
    name: this.name,
    priority: this.priority,
    delivery: this.delivery,
    triggeredAt: this.lastTriggered,
    data: data || {},
    webhookConfig: this.webhookConfig,
  };
};

alertSchema.methods.evaluateConditions = function(marketData: any): boolean {
  if (!this.conditions || this.conditions.length === 0) return false;
  
  const results = this.conditions.map(condition => {
    return this.evaluateCondition(condition, marketData);
  });
  
  if (this.logicalOperator === 'OR') {
    return results.some(result => result === true);
  } else {
    return results.every(result => result === true);
  }
};

alertSchema.methods.evaluateCondition = function(condition: IAlertCondition, marketData: any): boolean {
  const { type, operator, value, secondValue } = condition;
  
  let actualValue: number;
  
  // Extract the relevant value from market data based on condition type
  switch (type) {
    case 'price_above':
    case 'price_below':
      actualValue = marketData.price;
      break;
    case 'price_change_percent':
      actualValue = marketData.changePercentage;
      break;
    case 'volume_above':
    case 'volume_below':
      actualValue = marketData.volume;
      break;
    case 'market_cap_above':
    case 'market_cap_below':
      actualValue = marketData.marketCap;
      break;
    case 'rsi_above':
    case 'rsi_below':
      actualValue = marketData.technicalIndicators?.RSI || 50;
      break;
    default:
      return false;
  }
  
  // Apply operator logic
  switch (operator) {
    case 'greater_than':
      return actualValue > value;
    case 'less_than':
      return actualValue < value;
    case 'equals':
      return Math.abs(actualValue - value) < 0.001; // Allow for floating point precision
    case 'not_equals':
      return Math.abs(actualValue - value) >= 0.001;
    case 'between':
      return secondValue ? actualValue >= value && actualValue <= secondValue : false;
    case 'outside_range':
      return secondValue ? actualValue < value || actualValue > secondValue : false;
    default:
      return false;
  }
};

alertSchema.methods.clone = function(newUserId?: string) {
  const cloned = new (this.constructor as any)({
    ...this.toObject(),
    _id: undefined,
    userId: newUserId || this.userId,
    name: `${this.name} (Copy)`,
    triggeredCount: 0,
    lastTriggered: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  return cloned;
};

alertSchema.methods.disable = function() {
  this.isActive = false;
  return this.save();
};

alertSchema.methods.enable = function() {
  this.isActive = true;
  this.updateNextCheck();
  return this.save();
};

// Static methods
alertSchema.statics.findActiveByUser = function(userId: string, limit: number = 20) {
  return this.find({
    userId: new mongoose.Types.ObjectId(userId),
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  })
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

alertSchema.statics.findBySymbol = function(symbol: string, userId?: string, limit: number = 20) {
  const query: any = {
    symbol: symbol.toUpperCase(),
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

alertSchema.statics.findReadyToCheck = function(limit: number = 100) {
  const now = new Date();
  
  return this.find({
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: now } },
    ],
    $or: [
      { nextCheck: { $exists: false } },
      { nextCheck: { $lte: now } },
    ],
  })
    .sort({ priority: -1, nextCheck: 1 })
    .limit(limit);
};

alertSchema.statics.findByType = function(type: string, userId?: string, limit: number = 20) {
  const query: any = {
    type,
    isActive: true,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } },
    ],
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

alertSchema.statics.findRecentlyTriggered = function(userId?: string, hours: number = 24, limit: number = 50) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  const query: any = {
    lastTriggered: { $gte: cutoff },
  };
  
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(query)
    .sort({ lastTriggered: -1 })
    .limit(limit);
};

alertSchema.statics.getUserAlertStats = function(userId: string) {
  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      }
    },
    {
      $group: {
        _id: null,
        totalAlerts: { $sum: 1 },
        activeAlerts: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isActive', true] },
                  {
                    $or: [
                      { $eq: ['$expiresAt', null] },
                      { $gt: ['$expiresAt', new Date()] },
                    ],
                  },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalTriggers: { $sum: '$triggeredCount' },
        avgTriggersPerAlert: { $avg: '$triggeredCount' },
        alertsByType: {
          $push: '$type',
        },
        alertsByPriority: {
          $push: '$priority',
        },
      }
    }
  ]);
};

// Pre-save middleware
alertSchema.pre('save', function(next) {
  // Set nextCheck if not set
  if (this.isNew && this.isActive && !this.nextCheck) {
    this.updateNextCheck();
  }
  
  // Auto-generate tags based on conditions
  if (this.isNew) {
    const autoTags = [];
    
    this.conditions.forEach(condition => {
      autoTags.push(condition.type);
      if (condition.timeframe) autoTags.push(condition.timeframe);
    });
    
    autoTags.push(this.type);
    autoTags.push(this.priority);
    
    this.tags = [...new Set([...this.tags, ...autoTags])];
  }
  
  next();
});

// TTL index for automatic cleanup of expired alerts
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Alert = mongoose.model<IAlert>('Alert', alertSchema);
