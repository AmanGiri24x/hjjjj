import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export interface AIProvider {
  name: string;
  isAvailable: boolean;
  priority: number;
  capabilities: AICapability[];
}

export enum AICapability {
  SENTIMENT_ANALYSIS = 'sentiment_analysis',
  PRICE_PREDICTION = 'price_prediction',
  RISK_ASSESSMENT = 'risk_assessment',
  PORTFOLIO_OPTIMIZATION = 'portfolio_optimization',
  NEWS_ANALYSIS = 'news_analysis',
  TREND_ANALYSIS = 'trend_analysis',
  ANOMALY_DETECTION = 'anomaly_detection',
  FINANCIAL_SUMMARIZATION = 'financial_summarization'
}

export interface AIRequest {
  id: string;
  type: AICapability;
  data: any;
  options?: {
    priority?: 'low' | 'medium' | 'high' | 'critical';
    timeout?: number;
    retries?: number;
    provider?: string;
  };
  userId?: string;
  createdAt: Date;
}

export interface AIResponse {
  id: string;
  requestId: string;
  type: AICapability;
  result: any;
  confidence?: number;
  provider: string;
  processingTime: number;
  metadata?: {
    model?: string;
    version?: string;
    tokens?: {
      input: number;
      output: number;
    };
  };
  createdAt: Date;
}

export interface AIError {
  code: string;
  message: string;
  provider: string;
  retryable: boolean;
  details?: any;
}

export abstract class BaseAIService extends EventEmitter {
  protected provider: AIProvider;
  protected requestQueue: Map<string, AIRequest> = new Map();
  protected activeRequests: Set<string> = new Set();
  protected rateLimits: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(provider: AIProvider) {
    super();
    this.provider = provider;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.on('request:started', (requestId: string) => {
      this.activeRequests.add(requestId);
      logger.debug(`AI request started: ${requestId} (${this.provider.name})`);
    });

    this.on('request:completed', (requestId: string, result: AIResponse) => {
      this.activeRequests.delete(requestId);
      this.requestQueue.delete(requestId);
      logger.info(`AI request completed: ${requestId} in ${result.processingTime}ms`);
    });

    this.on('request:failed', (requestId: string, error: AIError) => {
      this.activeRequests.delete(requestId);
      if (!error.retryable) {
        this.requestQueue.delete(requestId);
      }
      logger.error(`AI request failed: ${requestId} - ${error.message}`);
    });
  }

  // Abstract methods to be implemented by specific AI providers
  abstract isHealthy(): Promise<boolean>;
  abstract getCapabilities(): AICapability[];
  abstract processRequest(request: AIRequest): Promise<AIResponse>;

  // Common functionality
  async queueRequest(request: AIRequest): Promise<string> {
    // Check rate limits
    if (await this.isRateLimited(request.userId)) {
      throw new Error(`Rate limit exceeded for provider ${this.provider.name}`);
    }

    // Add to queue
    this.requestQueue.set(request.id, request);
    
    // Emit event
    this.emit('request:queued', request.id, request);

    // Start processing if not at capacity
    if (this.canProcessMore()) {
      setImmediate(() => this.processNextRequest());
    }

    return request.id;
  }

  async processNextRequest(): Promise<void> {
    if (!this.canProcessMore() || this.requestQueue.size === 0) {
      return;
    }

    // Get highest priority request
    const request = this.getNextRequest();
    if (!request) return;

    try {
      this.emit('request:started', request.id);
      
      const startTime = Date.now();
      const result = await this.processRequest(request);
      const processingTime = Date.now() - startTime;

      result.processingTime = processingTime;
      this.emit('request:completed', request.id, result);

      // Process next request
      setImmediate(() => this.processNextRequest());

    } catch (error) {
      const aiError: AIError = {
        code: 'PROCESSING_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error',
        provider: this.provider.name,
        retryable: this.isRetryableError(error),
        details: error
      };

      this.emit('request:failed', request.id, aiError);

      // Retry if applicable
      if (aiError.retryable && this.shouldRetry(request)) {
        await this.retryRequest(request);
      }
    }
  }

  private getNextRequest(): AIRequest | null {
    const requests = Array.from(this.requestQueue.values());
    if (requests.length === 0) return null;

    // Sort by priority and creation time
    requests.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.options?.priority || 'medium'];
      const bPriority = priorityOrder[b.options?.priority || 'medium'];

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return requests[0];
  }

  private canProcessMore(): boolean {
    const maxConcurrent = parseInt(process.env.AI_MAX_CONCURRENT_REQUESTS || '5');
    return this.activeRequests.size < maxConcurrent;
  }

  private async isRateLimited(userId?: string): Promise<boolean> {
    if (!userId) return false;

    const key = `${this.provider.name}:${userId}`;
    const limit = this.rateLimits.get(key);
    const now = Date.now();

    if (!limit || now > limit.resetTime) {
      // Reset or create new limit
      const maxRequests = parseInt(process.env.AI_RATE_LIMIT_REQUESTS || '100');
      const windowMs = parseInt(process.env.AI_RATE_LIMIT_WINDOW || '3600000'); // 1 hour

      this.rateLimits.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return false;
    }

    if (limit.count >= parseInt(process.env.AI_RATE_LIMIT_REQUESTS || '100')) {
      return true;
    }

    limit.count++;
    return false;
  }

  private isRetryableError(error: any): boolean {
    // Check if error is retryable based on type/code
    if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
      return true;
    }

    if (error?.response?.status >= 500 && error?.response?.status < 600) {
      return true;
    }

    if (error?.response?.status === 429) { // Rate limited
      return true;
    }

    return false;
  }

  private shouldRetry(request: AIRequest): boolean {
    const maxRetries = request.options?.retries || 3;
    const currentRetries = (request as any).retryCount || 0;
    return currentRetries < maxRetries;
  }

  private async retryRequest(request: AIRequest): Promise<void> {
    const currentRetries = (request as any).retryCount || 0;
    (request as any).retryCount = currentRetries + 1;

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, currentRetries), 30000);
    
    setTimeout(() => {
      this.requestQueue.set(request.id, request);
      this.processNextRequest();
    }, delay);

    logger.warn(`Retrying AI request ${request.id} (attempt ${currentRetries + 1})`);
  }

  // Utility methods
  generateRequestId(): string {
    return `${this.provider.name}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getProviderInfo(): AIProvider {
    return { ...this.provider };
  }

  getQueueStatus(): {
    queued: number;
    active: number;
    provider: string;
  } {
    return {
      queued: this.requestQueue.size,
      active: this.activeRequests.size,
      provider: this.provider.name
    };
  }

  async clearQueue(): Promise<void> {
    this.requestQueue.clear();
    this.emit('queue:cleared');
    logger.info(`Queue cleared for provider ${this.provider.name}`);
  }

  // Cleanup method
  async shutdown(): Promise<void> {
    await this.clearQueue();
    this.removeAllListeners();
    logger.info(`AI service ${this.provider.name} shutdown completed`);
  }
}

export default BaseAIService;
