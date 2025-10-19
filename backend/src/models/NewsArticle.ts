import mongoose, { Schema } from 'mongoose';
import { INewsArticle, ISentimentAnalysis } from '../types';

const sentimentAnalysisSchema = new Schema<ISentimentAnalysis>({
  score: {
    type: Number,
    required: true,
    min: -1,
    max: 1,
  },
  magnitude: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  label: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    required: true,
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
  },
  emotions: [{
    emotion: {
      type: String,
      enum: ['joy', 'anger', 'fear', 'sadness', 'surprise', 'disgust', 'trust', 'anticipation'],
    },
    score: {
      type: Number,
      min: 0,
      max: 1,
    },
  }],
}, {
  _id: false,
});

const newsArticleSchema = new Schema<INewsArticle>({
  title: {
    type: String,
    required: true,
    trim: true,
    index: 'text',
  },
  content: {
    type: String,
    required: true,
    index: 'text',
  },
  summary: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  url: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must be a valid HTTP/HTTPS URL',
    },
  },
  author: {
    type: String,
    trim: true,
    index: true,
  },
  source: {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    reliability: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5,
    },
  },
  publishedAt: {
    type: Date,
    required: true,
    index: true,
  },
  category: {
    type: String,
    enum: [
      'market_news',
      'earnings',
      'mergers_acquisitions',
      'ipo',
      'economic_indicators',
      'cryptocurrency',
      'commodities',
      'forex',
      'central_banks',
      'regulations',
      'analysis',
      'opinion',
      'breaking_news',
    ],
    required: true,
    index: true,
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    index: true,
  }],
  symbols: [{
    type: String,
    uppercase: true,
    trim: true,
    index: true,
  }],
  sectors: [{
    type: String,
    trim: true,
    index: true,
  }],
  sentiment: sentimentAnalysisSchema,
  importance: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.5,
  },
  marketImpact: {
    type: String,
    enum: ['high', 'medium', 'low', 'minimal'],
    default: 'low',
    index: true,
  },
  language: {
    type: String,
    default: 'en',
    index: true,
  },
  imageUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'Image URL must be a valid image file',
    },
  },
  views: {
    type: Number,
    default: 0,
    min: 0,
  },
  isBreaking: {
    type: Boolean,
    default: false,
    index: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
    index: true,
  },
  metadata: {
    wordCount: {
      type: Number,
      min: 0,
    },
    readingTime: {
      type: Number, // in minutes
      min: 0,
    },
    keywords: [{
      word: String,
      frequency: Number,
      relevance: Number,
    }],
    entities: [{
      name: String,
      type: {
        type: String,
        enum: ['person', 'organization', 'location', 'event', 'product'],
      },
      confidence: Number,
    }],
  },
}, {
  timestamps: true,
});

// Indexes for optimal query performance
newsArticleSchema.index({ publishedAt: -1 });
newsArticleSchema.index({ category: 1, publishedAt: -1 });
newsArticleSchema.index({ symbols: 1, publishedAt: -1 });
newsArticleSchema.index({ sectors: 1, publishedAt: -1 });
newsArticleSchema.index({ 'sentiment.score': -1 });
newsArticleSchema.index({ importance: -1, publishedAt: -1 });
newsArticleSchema.index({ marketImpact: 1, publishedAt: -1 });
newsArticleSchema.index({ tags: 1, publishedAt: -1 });
newsArticleSchema.index({ isBreaking: 1, publishedAt: -1 });
newsArticleSchema.index({ 'source.name': 1, publishedAt: -1 });

// Text index for full-text search
newsArticleSchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  tags: 'text',
}, {
  weights: {
    title: 10,
    summary: 5,
    content: 1,
    tags: 3,
  },
});

// Compound indexes for complex queries
newsArticleSchema.index({
  symbols: 1,
  'sentiment.score': -1,
  publishedAt: -1,
});

newsArticleSchema.index({
  category: 1,
  importance: -1,
  publishedAt: -1,
});

// Methods
newsArticleSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.metadata.wordCount = wordCount;
  this.metadata.readingTime = Math.ceil(wordCount / wordsPerMinute);
};

newsArticleSchema.methods.extractKeywords = function(topN: number = 10) {
  const text = `${this.title} ${this.content}`.toLowerCase();
  const words = text.match(/\b\w+\b/g) || [];
  
  // Filter out common words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'will', 'would',
    'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  ]);
  
  const filteredWords = words.filter(word => 
    word.length > 2 && !stopWords.has(word) && !/^\d+$/.test(word)
  );
  
  const wordFreq = new Map<string, number>();
  filteredWords.forEach(word => {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  });
  
  const keywords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, frequency]) => ({
      word,
      frequency,
      relevance: frequency / filteredWords.length,
    }));
  
  this.metadata.keywords = keywords;
  return keywords;
};

newsArticleSchema.methods.isRecent = function(hours: number = 24): boolean {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return this.publishedAt >= cutoff;
};

newsArticleSchema.methods.getRelatedSymbols = function() {
  return this.symbols.filter(symbol => symbol.length <= 5); // Filter out invalid symbols
};

newsArticleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static methods
newsArticleSchema.statics.findBySymbol = function(symbol: string, limit: number = 20) {
  return this.find({ symbols: symbol.toUpperCase() })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.findBySector = function(sector: string, limit: number = 20) {
  return this.find({ sectors: new RegExp(sector, 'i') })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.findBreakingNews = function(limit: number = 10) {
  return this.find({ isBreaking: true })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.findByCategory = function(category: string, limit: number = 20) {
  return this.find({ category })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.findHighImpact = function(limit: number = 20) {
  return this.find({
    $or: [
      { marketImpact: 'high' },
      { importance: { $gte: 0.8 } },
      { isBreaking: true },
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.findBySentiment = function(
  sentimentType: 'positive' | 'negative' | 'neutral',
  limit: number = 20
) {
  return this.find({ 'sentiment.label': sentimentType })
    .sort({ 'sentiment.score': sentimentType === 'positive' ? -1 : 1, publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.searchByText = function(query: string, limit: number = 20) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 })
    .limit(limit);
};

newsArticleSchema.statics.findTrending = function(hours: number = 24, limit: number = 10) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({ publishedAt: { $gte: cutoff } })
    .sort({ views: -1, importance: -1, publishedAt: -1 })
    .limit(limit);
};

// Pre-save middleware
newsArticleSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('content')) {
    this.calculateReadingTime();
    this.extractKeywords();
  }
  
  // Auto-detect breaking news
  if (this.isNew) {
    const breakingKeywords = ['breaking', 'urgent', 'alert', 'emergency', 'crash', 'surge'];
    const titleLower = this.title.toLowerCase();
    
    this.isBreaking = breakingKeywords.some(keyword => titleLower.includes(keyword)) ||
      this.importance >= 0.9 ||
      this.marketImpact === 'high';
  }
  
  next();
});

// TTL index for automatic cleanup of old articles (90 days)
newsArticleSchema.index({ publishedAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const NewsArticle = mongoose.model<INewsArticle>('NewsArticle', newsArticleSchema);
