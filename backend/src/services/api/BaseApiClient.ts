import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { logger } from '../../config/logger';

export interface ApiClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerDay?: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
  headers?: any;
  rateLimitRemaining?: number;
  rateLimitReset?: number;
}

export abstract class BaseApiClient {
  protected client: AxiosInstance;
  protected config: ApiClientConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue = false;
  private requestCounts: { [key: string]: number } = {};
  private lastRequestTime = 0;

  constructor(config: ApiClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DhanAillytics/1.0',
      },
    });

    this.setupInterceptors();
    this.initializeRateLimiting();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
          params: config.params,
          headers: config.headers,
        });
        return config;
      },
      (error) => {
        logger.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.debug(`API Response: ${response.status} ${response.config.url}`, {
          data: response.data,
        });
        return response;
      },
      async (error) => {
        logger.error('API Response Error:', {
          status: error.response?.status,
          message: error.message,
          url: error.config?.url,
        });

        // Retry logic for specific status codes
        if (this.shouldRetry(error) && error.config && !error.config._retry) {
          error.config._retry = true;
          error.config._retryCount = (error.config._retryCount || 0) + 1;

          if (error.config._retryCount <= (this.config.retryAttempts || 3)) {
            logger.info(`Retrying request (attempt ${error.config._retryCount}/${this.config.retryAttempts || 3})`);
            
            // Wait before retrying
            await this.delay(this.config.retryDelay || 1000);
            return this.client(error.config);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: any): boolean {
    if (!error.response) return true; // Network error
    
    const status = error.response.status;
    return status === 429 || // Rate limit
           status === 502 || // Bad Gateway
           status === 503 || // Service Unavailable
           status === 504;   // Gateway Timeout
  }

  private initializeRateLimiting(): void {
    if (!this.config.rateLimit) return;

    // Reset counters every minute
    setInterval(() => {
      const currentMinute = Math.floor(Date.now() / 60000);
      this.requestCounts[currentMinute] = 0;
    }, 60000);

    // Reset daily counters at midnight
    if (this.config.rateLimit.requestsPerDay) {
      setInterval(() => {
        const currentDay = Math.floor(Date.now() / 86400000);
        this.requestCounts[`day_${currentDay}`] = 0;
      }, 86400000);
    }
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      await this.checkRateLimit();
      
      const response: AxiosResponse<T> = await this.client({
        url: endpoint,
        ...options,
      });

      this.updateRateLimitCounters();

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        headers: response.headers,
        rateLimitRemaining: this.parseRateLimitHeader(response.headers),
        rateLimitReset: this.parseRateLimitResetHeader(response.headers),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown API error',
        statusCode: error.response?.status,
        headers: error.response?.headers,
      };
    }
  }

  private async checkRateLimit(): Promise<void> {
    if (!this.config.rateLimit) return;

    const currentMinute = Math.floor(Date.now() / 60000);
    const currentMinuteRequests = this.requestCounts[currentMinute] || 0;

    if (currentMinuteRequests >= this.config.rateLimit.requestsPerMinute) {
      logger.warn('Rate limit reached, queueing request');
      await this.queueRequest();
    }

    // Check daily rate limit if configured
    if (this.config.rateLimit.requestsPerDay) {
      const currentDay = Math.floor(Date.now() / 86400000);
      const currentDayRequests = this.requestCounts[`day_${currentDay}`] || 0;

      if (currentDayRequests >= this.config.rateLimit.requestsPerDay) {
        throw new Error('Daily rate limit exceeded');
      }
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    const minDelay = 60000 / this.config.rateLimit.requestsPerMinute;
    
    if (timeSinceLastRequest < minDelay) {
      await this.delay(minDelay - timeSinceLastRequest);
    }
  }

  private updateRateLimitCounters(): void {
    this.lastRequestTime = Date.now();
    
    if (!this.config.rateLimit) return;

    const currentMinute = Math.floor(Date.now() / 60000);
    this.requestCounts[currentMinute] = (this.requestCounts[currentMinute] || 0) + 1;

    if (this.config.rateLimit.requestsPerDay) {
      const currentDay = Math.floor(Date.now() / 86400000);
      this.requestCounts[`day_${currentDay}`] = (this.requestCounts[`day_${currentDay}`] || 0) + 1;
    }
  }

  private async queueRequest(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(() => Promise.resolve(resolve()));
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.requestQueue.length === 0) return;

    this.isProcessingQueue = true;

    while (this.requestQueue.length > 0) {
      const currentMinute = Math.floor(Date.now() / 60000);
      const currentMinuteRequests = this.requestCounts[currentMinute] || 0;

      if (currentMinuteRequests < (this.config.rateLimit?.requestsPerMinute || Infinity)) {
        const request = this.requestQueue.shift();
        if (request) {
          await request();
        }
      } else {
        // Wait until next minute
        const waitTime = 60000 - (Date.now() % 60000);
        await this.delay(waitTime);
      }
    }

    this.isProcessingQueue = false;
  }

  private parseRateLimitHeader(headers: any): number | undefined {
    return headers['x-ratelimit-remaining'] || headers['ratelimit-remaining'];
  }

  private parseRateLimitResetHeader(headers: any): number | undefined {
    return headers['x-ratelimit-reset'] || headers['ratelimit-reset'];
  }

  protected delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/');
      return response.success;
    } catch (error) {
      logger.error('API health check failed:', error);
      return false;
    }
  }

  public getRateLimitStatus(): any {
    const currentMinute = Math.floor(Date.now() / 60000);
    const currentDay = Math.floor(Date.now() / 86400000);

    return {
      requestsThisMinute: this.requestCounts[currentMinute] || 0,
      requestsToday: this.requestCounts[`day_${currentDay}`] || 0,
      queueLength: this.requestQueue.length,
      lastRequestTime: this.lastRequestTime,
      rateLimits: this.config.rateLimit,
    };
  }

  // Abstract methods that subclasses must implement
  public abstract validateConnection(): Promise<boolean>;
  public abstract getQuote(symbol: string): Promise<ApiResponse<any>>;
  public abstract getBatchQuotes(symbols: string[]): Promise<ApiResponse<any>>;
}
