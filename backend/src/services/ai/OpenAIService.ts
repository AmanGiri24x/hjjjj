import axios, { AxiosInstance } from 'axios';
import { BaseAIService, AIProvider, AICapability, AIRequest, AIResponse } from './BaseAIService';
import { logger } from '../../utils/logger';

export interface OpenAIConfig {
  apiKey: string;
  baseURL?: string;
  organization?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export interface OpenAIModels {
  sentiment: string;
  analysis: string;
  prediction: string;
  summarization: string;
}

export class OpenAIService extends BaseAIService {
  private client: AxiosInstance;
  private config: OpenAIConfig;
  private models: OpenAIModels;

  constructor(config: OpenAIConfig) {
    const provider: AIProvider = {
      name: 'OpenAI',
      isAvailable: !!config.apiKey,
      priority: 1,
      capabilities: [
        AICapability.SENTIMENT_ANALYSIS,
        AICapability.NEWS_ANALYSIS,
        AICapability.FINANCIAL_SUMMARIZATION,
        AICapability.RISK_ASSESSMENT,
        AICapability.TREND_ANALYSIS
      ]
    };

    super(provider);
    
    this.config = {
      baseURL: 'https://api.openai.com/v1',
      maxTokens: 2048,
      temperature: 0.3,
      model: 'gpt-4',
      ...config
    };

    this.models = {
      sentiment: this.config.model!,
      analysis: this.config.model!,
      prediction: this.config.model!,
      summarization: this.config.model!
    };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...(this.config.organization && { 'OpenAI-Organization': this.config.organization })
      },
      timeout: 60000 // 60 seconds
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`OpenAI API request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('OpenAI API request error:', error);
        return Promise.reject(error);
      }
    );

    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`OpenAI API response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        logger.error('OpenAI API response error:', error?.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async isHealthy(): Promise<boolean> {
    try {
      const response = await this.client.get('/models');
      return response.status === 200;
    } catch (error) {
      logger.error('OpenAI health check failed:', error);
      return false;
    }
  }

  getCapabilities(): AICapability[] {
    return this.provider.capabilities;
  }

  async processRequest(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    try {
      let result: any;
      
      switch (request.type) {
        case AICapability.SENTIMENT_ANALYSIS:
          result = await this.analyzeSentiment(request.data);
          break;
        case AICapability.NEWS_ANALYSIS:
          result = await this.analyzeNews(request.data);
          break;
        case AICapability.FINANCIAL_SUMMARIZATION:
          result = await this.summarizeFinancialData(request.data);
          break;
        case AICapability.RISK_ASSESSMENT:
          result = await this.assessRisk(request.data);
          break;
        case AICapability.TREND_ANALYSIS:
          result = await this.analyzeTrends(request.data);
          break;
        default:
          throw new Error(`Unsupported capability: ${request.type}`);
      }

      return {
        id: this.generateRequestId(),
        requestId: request.id,
        type: request.type,
        result,
        confidence: result.confidence || 0.8,
        provider: this.provider.name,
        processingTime: Date.now() - startTime,
        metadata: {
          model: this.getModelForCapability(request.type),
          version: 'gpt-4',
          tokens: result.tokens || { input: 0, output: 0 }
        },
        createdAt: new Date()
      };
    } catch (error) {
      logger.error(`OpenAI request processing failed:`, error);
      throw error;
    }
  }

  private async analyzeSentiment(data: {
    text: string;
    context?: 'financial' | 'news' | 'social';
  }): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    confidence: number;
    emotions?: string[];
    keywords?: string[];
    reasoning?: string;
  }> {
    const prompt = this.buildSentimentPrompt(data);
    
    const response = await this.client.post('/chat/completions', {
      model: this.models.sentiment,
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial sentiment analyst. Analyze the sentiment of financial texts and provide detailed insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.data.choices[0].message.content;
    const result = JSON.parse(content);

    return {
      sentiment: result.sentiment,
      score: result.score,
      confidence: result.confidence,
      emotions: result.emotions || [],
      keywords: result.keywords || [],
      reasoning: result.reasoning
    };
  }

  private async analyzeNews(data: {
    articles: Array<{
      title: string;
      content: string;
      source?: string;
      publishedAt?: string;
    }>;
    symbol?: string;
    sector?: string;
  }): Promise<{
    overallSentiment: 'positive' | 'negative' | 'neutral';
    sentimentScore: number;
    impact: 'high' | 'medium' | 'low';
    keyTopics: string[];
    marketImplications: string[];
    summary: string;
    articleAnalysis: Array<{
      title: string;
      sentiment: string;
      score: number;
      relevance: number;
    }>;
  }> {
    const prompt = this.buildNewsAnalysisPrompt(data);
    
    const response = await this.client.post('/chat/completions', {
      model: this.models.analysis,
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial news analyst. Analyze news articles for market impact and sentiment, focusing on investment implications.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  private async summarizeFinancialData(data: {
    type: 'earnings' | 'financial_statements' | 'market_data' | 'portfolio';
    data: any;
    symbol?: string;
    period?: string;
  }): Promise<{
    summary: string;
    keyMetrics: Array<{
      metric: string;
      value: string;
      significance: string;
    }>;
    insights: string[];
    recommendations: string[];
    risks: string[];
    opportunities: string[];
  }> {
    const prompt = this.buildSummarizationPrompt(data);
    
    const response = await this.client.post('/chat/completions', {
      model: this.models.summarization,
      messages: [
        {
          role: 'system',
          content: 'You are an expert financial analyst. Summarize complex financial data into clear, actionable insights for investors.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  private async assessRisk(data: {
    type: 'portfolio' | 'stock' | 'sector';
    data: any;
    timeframe?: '1M' | '3M' | '6M' | '1Y' | '2Y';
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
  }): Promise<{
    riskLevel: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
    riskScore: number;
    confidence: number;
    riskFactors: Array<{
      factor: string;
      impact: 'high' | 'medium' | 'low';
      description: string;
    }>;
    recommendations: string[];
    hedgingSuggestions?: string[];
    volatilityAnalysis: {
      current: number;
      historical: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
  }> {
    const prompt = this.buildRiskAssessmentPrompt(data);
    
    const response = await this.client.post('/chat/completions', {
      model: this.models.analysis,
      messages: [
        {
          role: 'system',
          content: 'You are an expert risk management analyst. Assess financial risks and provide detailed risk analysis with actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  private async analyzeTrends(data: {
    type: 'price' | 'volume' | 'technical' | 'fundamental';
    timeSeries: Array<{
      date: string;
      value: number;
      volume?: number;
    }>;
    symbol?: string;
    indicators?: string[];
  }): Promise<{
    trend: 'bullish' | 'bearish' | 'sideways';
    strength: 'strong' | 'moderate' | 'weak';
    confidence: number;
    duration: string;
    keyLevels: {
      support: number[];
      resistance: number[];
    };
    patterns: Array<{
      pattern: string;
      reliability: number;
      implication: string;
    }>;
    forecast: {
      shortTerm: string;
      mediumTerm: string;
      longTerm: string;
    };
  }> {
    const prompt = this.buildTrendAnalysisPrompt(data);
    
    const response = await this.client.post('/chat/completions', {
      model: this.models.analysis,
      messages: [
        {
          role: 'system',
          content: 'You are an expert technical and fundamental analyst. Analyze market trends and provide detailed trend analysis with forecasts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  }

  // Prompt builders
  private buildSentimentPrompt(data: any): string {
    return `
Analyze the sentiment of the following ${data.context || 'financial'} text:

Text: "${data.text}"

Please provide a detailed sentiment analysis in JSON format with the following structure:
{
  "sentiment": "positive|negative|neutral",
  "score": number between -1 and 1,
  "confidence": number between 0 and 1,
  "emotions": ["emotion1", "emotion2"],
  "keywords": ["keyword1", "keyword2"],
  "reasoning": "explanation of the sentiment analysis"
}

Focus on financial implications and market sentiment indicators.
`;
  }

  private buildNewsAnalysisPrompt(data: any): string {
    const articlesText = data.articles.map((article: any, index: number) => 
      `Article ${index + 1}:
Title: ${article.title}
Content: ${article.content.substring(0, 500)}...
Source: ${article.source || 'Unknown'}
Published: ${article.publishedAt || 'Unknown'}`
    ).join('\n\n');

    return `
Analyze the following news articles for market impact and sentiment:

${articlesText}

${data.symbol ? `Focus on implications for ${data.symbol}.` : ''}
${data.sector ? `Consider sector-wide impacts for ${data.sector}.` : ''}

Please provide analysis in JSON format with:
{
  "overallSentiment": "positive|negative|neutral",
  "sentimentScore": number between -1 and 1,
  "impact": "high|medium|low",
  "keyTopics": ["topic1", "topic2"],
  "marketImplications": ["implication1", "implication2"],
  "summary": "brief overall summary",
  "articleAnalysis": [
    {
      "title": "article title",
      "sentiment": "sentiment",
      "score": number,
      "relevance": number between 0 and 1
    }
  ]
}
`;
  }

  private buildSummarizationPrompt(data: any): string {
    return `
Summarize and analyze the following ${data.type} data:

Data: ${JSON.stringify(data.data, null, 2)}

${data.symbol ? `Symbol: ${data.symbol}` : ''}
${data.period ? `Period: ${data.period}` : ''}

Please provide analysis in JSON format with:
{
  "summary": "clear, concise summary",
  "keyMetrics": [
    {
      "metric": "metric name",
      "value": "metric value",
      "significance": "why this matters"
    }
  ],
  "insights": ["insight1", "insight2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "risks": ["risk1", "risk2"],
  "opportunities": ["opportunity1", "opportunity2"]
}

Focus on actionable insights for investors.
`;
  }

  private buildRiskAssessmentPrompt(data: any): string {
    return `
Assess the risk for the following ${data.type}:

Data: ${JSON.stringify(data.data, null, 2)}

${data.timeframe ? `Timeframe: ${data.timeframe}` : ''}
${data.riskProfile ? `Risk Profile: ${data.riskProfile}` : ''}

Please provide risk assessment in JSON format with:
{
  "riskLevel": "very_low|low|medium|high|very_high",
  "riskScore": number between 0 and 100,
  "confidence": number between 0 and 1,
  "riskFactors": [
    {
      "factor": "risk factor",
      "impact": "high|medium|low",
      "description": "detailed description"
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "hedgingSuggestions": ["hedging1", "hedging2"],
  "volatilityAnalysis": {
    "current": number,
    "historical": number,
    "trend": "increasing|decreasing|stable"
  }
}
`;
  }

  private buildTrendAnalysisPrompt(data: any): string {
    const timeSeriesText = data.timeSeries.slice(-20).map((point: any) => 
      `${point.date}: ${point.value}${point.volume ? ` (Vol: ${point.volume})` : ''}`
    ).join('\n');

    return `
Analyze trends in the following ${data.type} time series data:

Recent Data Points:
${timeSeriesText}

${data.symbol ? `Symbol: ${data.symbol}` : ''}
${data.indicators ? `Technical Indicators: ${data.indicators.join(', ')}` : ''}

Please provide trend analysis in JSON format with:
{
  "trend": "bullish|bearish|sideways",
  "strength": "strong|moderate|weak",
  "confidence": number between 0 and 1,
  "duration": "estimated trend duration",
  "keyLevels": {
    "support": [level1, level2],
    "resistance": [level1, level2]
  },
  "patterns": [
    {
      "pattern": "pattern name",
      "reliability": number between 0 and 1,
      "implication": "what this means"
    }
  ],
  "forecast": {
    "shortTerm": "1-4 weeks outlook",
    "mediumTerm": "1-3 months outlook", 
    "longTerm": "3-12 months outlook"
  }
}
`;
  }

  private getModelForCapability(capability: AICapability): string {
    switch (capability) {
      case AICapability.SENTIMENT_ANALYSIS:
        return this.models.sentiment;
      case AICapability.FINANCIAL_SUMMARIZATION:
        return this.models.summarization;
      default:
        return this.models.analysis;
    }
  }

  // Utility methods
  async estimateTokens(text: string): Promise<number> {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  async getModelList(): Promise<string[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.data.map((model: any) => model.id);
    } catch (error) {
      logger.error('Failed to get model list:', error);
      return [];
    }
  }

  updateConfig(config: Partial<OpenAIConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (config.apiKey) {
      this.client.defaults.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
    
    if (config.organization) {
      this.client.defaults.headers['OpenAI-Organization'] = config.organization;
    }
  }
}

export default OpenAIService;
