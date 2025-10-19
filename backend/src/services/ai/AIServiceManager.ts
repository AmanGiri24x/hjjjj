import { EventEmitter } from 'events';
import { BaseAIService, AICapability, AIRequest, AIResponse, AIError, AIProvider } from './BaseAIService';
import { OpenAIService, OpenAIConfig } from './OpenAIService';
import { TechnicalAnalysisService } from './TechnicalAnalysisService';
import { logger } from '../../utils/logger';
import { redisClient } from '../../config/redis';

export interface AIServiceConfig {
  openai?: OpenAIConfig;
  caching?: {
    enabled: boolean;
    ttl: number; // seconds
    keyPrefix: string;
  };
  fallbackStrategy?: 'none' | 'next_available' | 'all_providers';
  requestTimeout?: number;
  maxConcurrentRequests?: number;
}

export interface AIServiceStatus {
  totalProviders: number;
  availableProviders: number;
  healthyProviders: string[];
  unhealthyProviders: string[];
  queueStatus: Array<{
    provider: string;
    queued: number;
    active: number;
  }>;
  capabilities: Record<AICapability, string[]>;
}

export class AIServiceManager extends EventEmitter {
  private providers: Map<string, BaseAIService> = new Map();
  private config: AIServiceConfig;
  private requestCache: Map<string, { response: AIResponse; expiry: number }> = new Map();

  constructor(config: AIServiceConfig) {
    super();
    this.config = {
      caching: {
        enabled: true,
        ttl: 300, // 5 minutes
        keyPrefix: 'ai_cache:',
      },
      fallbackStrategy: 'next_available',
      requestTimeout: 60000, // 60 seconds
      maxConcurrentRequests: 10,
      ...config,
    };

    this.initializeProviders();
    this.setupHealthChecks();
    this.setupCacheCleanup();
  }

  private initializeProviders(): void {
    // Initialize OpenAI service if configured
    if (this.config.openai?.apiKey) {
      const openaiService = new OpenAIService(this.config.openai);
      this.providers.set('OpenAI', openaiService);
      logger.info('OpenAI service initialized');
    }

    // Initialize Technical Analysis service (always available)
    const technicalService = new TechnicalAnalysisService();
    this.providers.set('TechnicalAnalysis', technicalService);
    logger.info('Technical Analysis service initialized');

    // Setup provider event handlers
    this.providers.forEach((provider, name) => {
      provider.on('request:queued', (requestId, request) => {
        this.emit('request:queued', requestId, request, name);
      });

      provider.on('request:completed', (requestId, result) => {
        this.emit('request:completed', requestId, result, name);
        this.cacheResponse(requestId, result);
      });

      provider.on('request:failed', (requestId, error) => {
        this.emit('request:failed', requestId, error, name);
      });
    });

    logger.info(`AI Service Manager initialized with ${this.providers.size} providers`);
  }

  private setupHealthChecks(): void {
    // Perform health checks every 5 minutes
    setInterval(async () => {
      await this.performHealthChecks();
    }, 5 * 60 * 1000);

    // Initial health check
    setTimeout(() => this.performHealthChecks(), 1000);
  }

  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.providers.entries()).map(
      async ([name, provider]) => {
        try {
          const isHealthy = await provider.isHealthy();
          return { name, healthy: isHealthy };
        } catch (error) {
          logger.error(`Health check failed for ${name}:`, error);
          return { name, healthy: false };
        }
      }
    );

    const results = await Promise.all(healthPromises);
    
    results.forEach(({ name, healthy }) => {
      const provider = this.providers.get(name);
      if (provider) {
        provider.getProviderInfo().isAvailable = healthy;
        if (healthy) {
          this.emit('provider:healthy', name);
        } else {
          this.emit('provider:unhealthy', name);
        }
      }
    });

    const healthyCount = results.filter(r => r.healthy).length;
    logger.debug(`Health check completed: ${healthyCount}/${results.length} providers healthy`);
  }

  private setupCacheCleanup(): void {
    if (!this.config.caching?.enabled) return;

    // Clean up expired cache entries every minute
    setInterval(() => {
      this.cleanupCache();
    }, 60 * 1000);
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.requestCache.entries()) {
      if (now > entry.expiry) {
        this.requestCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  // Public API methods
  async processRequest(request: AIRequest): Promise<AIResponse> {
    try {
      // Check cache first
      if (this.config.caching?.enabled) {
        const cached = this.getCachedResponse(request);
        if (cached) {
          logger.debug(`Cache hit for request ${request.id}`);
          return cached;
        }
      }

      // Find capable providers
      const capableProviders = this.findCapableProviders(request.type);
      
      if (capableProviders.length === 0) {
        throw new Error(`No providers available for capability: ${request.type}`);
      }

      // Try providers in priority order
      let lastError: Error | null = null;
      
      for (const provider of capableProviders) {
        try {
          logger.info(`Processing request ${request.id} with provider ${provider.getProviderInfo().name}`);
          
          const response = await this.executeWithTimeout(
            provider.queueRequest(request).then(() => 
              new Promise<AIResponse>((resolve, reject) => {
                provider.once('request:completed', (requestId, result) => {
                  if (requestId === request.id) resolve(result);
                });
                provider.once('request:failed', (requestId, error) => {
                  if (requestId === request.id) reject(new Error(error.message));
                });
              })
            ),
            this.config.requestTimeout!
          );

          return response;
          
        } catch (error) {
          lastError = error as Error;
          logger.warn(`Provider ${provider.getProviderInfo().name} failed for request ${request.id}:`, error);
          
          // If fallback strategy is 'none', don't try other providers
          if (this.config.fallbackStrategy === 'none') {
            break;
          }
          
          // Continue to next provider
          continue;
        }
      }

      // If we get here, all providers failed
      throw lastError || new Error('All providers failed to process the request');
      
    } catch (error) {
      logger.error(`Request ${request.id} failed:`, error);
      throw error;
    }
  }

  async batchProcess(requests: AIRequest[]): Promise<Map<string, AIResponse | Error>> {
    const results = new Map<string, AIResponse | Error>();
    
    // Group requests by capability to optimize provider usage
    const requestGroups = new Map<AICapability, AIRequest[]>();
    
    requests.forEach(request => {
      if (!requestGroups.has(request.type)) {
        requestGroups.set(request.type, []);
      }
      requestGroups.get(request.type)!.push(request);
    });

    // Process groups concurrently
    const groupPromises = Array.from(requestGroups.entries()).map(
      async ([capability, groupRequests]) => {
        const providers = this.findCapableProviders(capability);
        if (providers.length === 0) {
          groupRequests.forEach(req => {
            results.set(req.id, new Error(`No providers available for ${capability}`));
          });
          return;
        }

        // Process requests in the group
        const requestPromises = groupRequests.map(async (request) => {
          try {
            const response = await this.processRequest(request);
            results.set(request.id, response);
          } catch (error) {
            results.set(request.id, error as Error);
          }
        });

        await Promise.all(requestPromises);
      }
    );

    await Promise.all(groupPromises);
    return results;
  }

  // Capability and provider management
  getCapabilities(): Record<AICapability, string[]> {
    const capabilities: Record<AICapability, string[]> = {} as any;
    
    Object.values(AICapability).forEach(capability => {
      capabilities[capability] = [];
    });

    this.providers.forEach((provider, name) => {
      const providerCapabilities = provider.getCapabilities();
      providerCapabilities.forEach(capability => {
        if (!capabilities[capability]) {
          capabilities[capability] = [];
        }
        capabilities[capability].push(name);
      });
    });

    return capabilities;
  }

  private findCapableProviders(capability: AICapability): BaseAIService[] {
    const providers: BaseAIService[] = [];

    this.providers.forEach((provider) => {
      const providerInfo = provider.getProviderInfo();
      if (providerInfo.isAvailable && providerInfo.capabilities.includes(capability)) {
        providers.push(provider);
      }
    });

    // Sort by priority (higher priority first)
    return providers.sort((a, b) => 
      b.getProviderInfo().priority - a.getProviderInfo().priority
    );
  }

  // Status and monitoring
  async getStatus(): Promise<AIServiceStatus> {
    const healthChecks = await Promise.all(
      Array.from(this.providers.entries()).map(async ([name, provider]) => ({
        name,
        healthy: await provider.isHealthy().catch(() => false),
        queueStatus: provider.getQueueStatus()
      }))
    );

    const healthyProviders = healthChecks
      .filter(check => check.healthy)
      .map(check => check.name);
    
    const unhealthyProviders = healthChecks
      .filter(check => !check.healthy)
      .map(check => check.name);

    return {
      totalProviders: this.providers.size,
      availableProviders: healthyProviders.length,
      healthyProviders,
      unhealthyProviders,
      queueStatus: healthChecks.map(check => ({
        provider: check.name,
        queued: check.queueStatus.queued,
        active: check.queueStatus.active
      })),
      capabilities: this.getCapabilities()
    };
  }

  getProvider(name: string): BaseAIService | undefined {
    return this.providers.get(name);
  }

  // Utility methods
  private async executeWithTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  private generateCacheKey(request: AIRequest): string {
    const dataHash = this.hashObject(request.data);
    return `${this.config.caching?.keyPrefix}${request.type}_${dataHash}`;
  }

  private hashObject(obj: any): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
  }

  private getCachedResponse(request: AIRequest): AIResponse | null {
    if (!this.config.caching?.enabled) return null;

    const cacheKey = this.generateCacheKey(request);
    const cached = this.requestCache.get(cacheKey);

    if (cached && Date.now() < cached.expiry) {
      return {
        ...cached.response,
        id: this.generateRequestId(), // New ID for the response
        requestId: request.id,
        createdAt: new Date(),
        metadata: {
          ...cached.response.metadata,
          cached: true
        }
      };
    }

    return null;
  }

  private cacheResponse(requestId: string, response: AIResponse): void {
    if (!this.config.caching?.enabled) return;

    // Generate cache key from the original request
    // Note: In a real implementation, you'd want to store the request data to generate the key
    const cacheKey = `${this.config.caching.keyPrefix}${response.type}_${requestId}`;
    const expiry = Date.now() + (this.config.caching.ttl * 1000);

    this.requestCache.set(cacheKey, { response, expiry });
  }

  private generateRequestId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  // Specialized analysis methods
  async analyzeSentiment(text: string, options?: {
    context?: 'financial' | 'news' | 'social';
    priority?: 'low' | 'medium' | 'high' | 'critical';
    provider?: string;
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.SENTIMENT_ANALYSIS,
      data: {
        text,
        context: options?.context || 'financial'
      },
      options: {
        priority: options?.priority || 'medium',
        provider: options?.provider
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  async analyzeNews(articles: Array<{
    title: string;
    content: string;
    source?: string;
    publishedAt?: string;
  }>, options?: {
    symbol?: string;
    sector?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.NEWS_ANALYSIS,
      data: {
        articles,
        symbol: options?.symbol,
        sector: options?.sector
      },
      options: {
        priority: options?.priority || 'medium'
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  async analyzeTechnical(priceData: any[], options?: {
    timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
    indicators?: string[];
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.TREND_ANALYSIS,
      data: {
        prices: priceData,
        timeframe: options?.timeframe || '1d',
        indicators: options?.indicators
      },
      options: {
        priority: options?.priority || 'medium'
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  async assessRisk(data: any, options?: {
    type?: 'portfolio' | 'stock' | 'sector';
    timeframe?: '1M' | '3M' | '6M' | '1Y' | '2Y';
    riskProfile?: 'conservative' | 'moderate' | 'aggressive';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.RISK_ASSESSMENT,
      data: {
        type: options?.type || 'stock',
        data,
        timeframe: options?.timeframe,
        riskProfile: options?.riskProfile
      },
      options: {
        priority: options?.priority || 'medium'
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  async predictPrice(priceData: any[], options?: {
    timeframe?: '1d' | '7d' | '30d' | '90d';
    method?: 'sma' | 'ema' | 'linear_regression' | 'lstm';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.PRICE_PREDICTION,
      data: {
        prices: priceData,
        timeframe: options?.timeframe || '7d',
        method: options?.method || 'linear_regression'
      },
      options: {
        priority: options?.priority || 'medium'
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  async detectAnomalies(priceData: any[], options?: {
    sensitivity?: 'low' | 'medium' | 'high';
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.ANOMALY_DETECTION,
      data: {
        prices: priceData,
        sensitivity: options?.sensitivity || 'medium'
      },
      options: {
        priority: options?.priority || 'medium'
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  async summarizeFinancial(data: any, options?: {
    type?: 'earnings' | 'financial_statements' | 'market_data' | 'portfolio';
    symbol?: string;
    period?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
  }): Promise<AIResponse> {
    const request: AIRequest = {
      id: this.generateRequestId(),
      type: AICapability.FINANCIAL_SUMMARIZATION,
      data: {
        type: options?.type || 'market_data',
        data,
        symbol: options?.symbol,
        period: options?.period
      },
      options: {
        priority: options?.priority || 'medium'
      },
      createdAt: new Date()
    };

    return this.processRequest(request);
  }

  // Lifecycle management
  async shutdown(): Promise<void> {
    logger.info('Shutting down AI Service Manager...');

    const shutdownPromises = Array.from(this.providers.values()).map(
      provider => provider.shutdown()
    );

    await Promise.all(shutdownPromises);
    
    this.requestCache.clear();
    this.removeAllListeners();
    
    logger.info('AI Service Manager shutdown completed');
  }

  // Configuration updates
  updateConfig(config: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Update provider configurations if needed
    if (config.openai && this.providers.has('OpenAI')) {
      const openaiService = this.providers.get('OpenAI') as OpenAIService;
      openaiService.updateConfig(config.openai);
    }

    logger.info('AI Service Manager configuration updated');
  }
}

export default AIServiceManager;
